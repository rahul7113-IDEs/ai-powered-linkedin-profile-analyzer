import os
import json
import pandas as pd
import torch
import torch.nn as nn
from datasets import Dataset
from tqdm import tqdm
from torch.utils.data import DataLoader
from torch.optim import AdamW
from transformers import AutoTokenizer, AutoModel
from sklearn.model_selection import train_test_split
from sentence_transformers import SentenceTransformer, util

# ==========================================
# CONFIG
# ==========================================
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
OUTPUT_DIR = "/kaggle/working/model_v1"

DATA_DIRS = [
    "/kaggle/input/datasets/shitanshgupta/datase",
    "/kaggle/input/datasets/shitanshgupta/dataseet",
    "/kaggle/input/datasets/shitanshgupta/linkedin"
]

BATCH_SIZE = 32
EPOCHS = 3
LR = 2e-5

sim_model = SentenceTransformer("all-MiniLM-L6-v2")

# ==========================================
# SAFE HELPERS
# ==========================================
def safe_read_csv(path):
    try:
        return pd.read_csv(path, encoding="utf-8")
    except:
        try:
            return pd.read_csv(path, encoding="latin1")
        except:
            print(f"❌ Failed: {path}")
            return None

def get_column(df, possible_names):
    for col in df.columns:
        if col.lower() in possible_names:
            return df[col]
    return None

# ==========================================
# DATASET HANDLERS
# ==========================================
def load_structured_resume(df):
    skills = get_column(df, ["skills"])
    exp = get_column(df, ["experience"])
    edu = get_column(df, ["education"])

    if skills is None:
        return None

    text = (
        skills.fillna("").astype(str) + " " +
        (exp.fillna("").astype(str) if exp is not None else "") + " " +
        (edu.fillna("").astype(str) if edu is not None else "")
    )

    category = get_column(df, ["job_role", "category"])
    if category is None:
        category = ["Unknown"] * len(df)

    return pd.DataFrame({
        "text": text,
        "category": pd.Series(category).astype(str),
        "score": 0.6
    })


def load_job_matching(df):
    resume_col = get_column(df, ["resume", "cv", "text"])
    jd_col = get_column(df, ["job_description", "description", "jd"])

    if resume_col is None or jd_col is None:
        print("⚠️ Skipping job dataset (missing columns)")
        return None

    text = resume_col.astype(str) + " " + jd_col.astype(str)

    category = get_column(df, ["job_title", "role", "category"])
    if category is None:
        category = ["Unknown"] * len(df)

    score = get_column(df, ["label", "match", "selected"])
    if score is None:
        score = [1] * len(df)

    return pd.DataFrame({
        "text": text,
        "category": pd.Series(category).astype(str),
        "score": pd.Series(score)
    })


def load_skills_dataset(df):
    skills = get_column(df, ["skills"])
    if skills is None:
        return None

    return pd.DataFrame({
        "text": skills.astype(str),
        "category": ["Skill-Based"] * len(df),
        "score": 0.3
    })


def load_generic(df):
    text = None
    for col in df.columns:
        if any(x in col.lower() for x in ["resume","text","content","description"]):
            text = df[col]
            break

    if text is None:
        return None

    category = get_column(df, ["category", "role"])

    if category is None:
        category = ["Unknown"] * len(df)

    return pd.DataFrame({
        "text": text.fillna("").astype(str),
        "category": pd.Series(category).astype(str),
        "score": 0.5
    })

# ==========================================
# SMART LOADER
# ==========================================
def smart_loader(path):
    df = safe_read_csv(path)
    if df is None:
        return None

    print(f"\n📄 Processing: {os.path.basename(path)}")
    print("Columns:", df.columns.tolist())

    cols = [c.lower() for c in df.columns]

    if "skills" in cols and "experience" in cols:
        print("➡ Structured Resume detected")
        return load_structured_resume(df)

    elif "job_description" in cols:
        print("➡ Job Matching dataset detected")
        return load_job_matching(df)

    elif "skills" in cols and len(cols) < 5:
        print("➡ Skills dataset detected")
        return load_skills_dataset(df)

    else:
        print("➡ Generic dataset detected")
        return load_generic(df)

# ==========================================
# LOAD DATA
# ==========================================
def load_data():
    all_dfs = []

    for d in DATA_DIRS:
        print(f"\n📂 Scanning: {d}")

        for root, _, files in os.walk(d):
            for f in files:
                if not f.endswith(".csv"):
                    continue

                path = os.path.join(root, f)
                df = smart_loader(path)

                if df is not None and not df.empty:
                    df = df[df["text"].str.len() > 30]
                    all_dfs.append(df)
                    print(f"✅ Loaded {f} ({len(df)} rows)")

    if len(all_dfs) == 0:
        raise ValueError("❌ No valid datasets loaded")

    df = pd.concat(all_dfs, ignore_index=True)

    print("\nBefore cleaning:", len(df))

    df = df.drop_duplicates(subset=["text"])
    df = df[df["category"] != "Unknown"]

    counts = df["category"].value_counts()
    df = df[df["category"].isin(counts[counts > 50].index)]

    print("Final size:", len(df))

    return df.sample(frac=1, random_state=42)

# ==========================================
# MODEL
# ==========================================
class ResumeModel(nn.Module):
    def __init__(self, model_name, num_labels):
        super().__init__()
        self.bert = AutoModel.from_pretrained(model_name)
        hidden = self.bert.config.hidden_size
        self.classifier = nn.Linear(hidden, num_labels)
        self.regressor = nn.Linear(hidden, 1)

    def forward(self, input_ids, attention_mask, labels=None, scores=None):
        out = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        cls = out.last_hidden_state[:, 0]

        logits = self.classifier(cls)
        score = self.regressor(cls)

        loss = None
        if labels is not None and scores is not None:
            loss = nn.CrossEntropyLoss()(logits, labels) + \
                   nn.MSELoss()(score.squeeze(), scores.float())

        return {"loss": loss, "logits": logits, "score": score}

# ==========================================
# TRAIN
# ==========================================
def train():
    df = load_data()

    label2id = {c:i for i,c in enumerate(sorted(df["category"].unique()))}
    id2label = {i:c for c,i in label2id.items()}
    df["label"] = df["category"].map(label2id)

    train_df, val_df = train_test_split(df, test_size=0.1, stratify=df["category"])

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    def tokenize(x):
        return tokenizer(x["text"], padding="max_length", truncation=True, max_length=256)

    train_ds = Dataset.from_pandas(train_df).map(tokenize, batched=True)
    val_ds = Dataset.from_pandas(val_df).map(tokenize, batched=True)

    train_ds.set_format("torch")
    val_ds.set_format("torch")

    model = ResumeModel(MODEL_NAME, len(label2id))
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE)

    optimizer = AdamW(model.parameters(), lr=LR)

    for epoch in range(EPOCHS):

        # ================= TRAIN =================
        model.train()
        total_loss, correct, total = 0, 0, 0

        for batch in tqdm(train_loader, desc=f"Epoch {epoch+1} Train"):
            batch = {k:v.to(device) for k,v in batch.items() if k in ["input_ids","attention_mask","label","score"]}

            out = model(
                input_ids=batch["input_ids"],
                attention_mask=batch["attention_mask"],
                labels=batch["label"],
                scores=batch["score"]
            )

            preds = torch.argmax(out["logits"], dim=1)
            correct += (preds == batch["label"]).sum().item()
            total += batch["label"].size(0)

            loss = out["loss"]

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        train_acc = correct / total

        # ================= VALIDATION =================
        model.eval()
        val_correct, val_total, top3_correct = 0, 0, 0

        with torch.no_grad():
            for batch in val_loader:
                batch = {k:v.to(device) for k,v in batch.items() if k in ["input_ids","attention_mask","label"]}

                out = model(
                    input_ids=batch["input_ids"],
                    attention_mask=batch["attention_mask"]
                )

                logits = out["logits"]

                preds = torch.argmax(logits, dim=1)
                top3 = torch.topk(logits, k=3, dim=1).indices

                val_correct += (preds == batch["label"]).sum().item()
                val_total += batch["label"].size(0)

                # Top-3 Accuracy
                for i in range(len(top3)):
                    if batch["label"][i] in top3[i]:
                        top3_correct += 1

        val_acc = val_correct / val_total
        top3_acc = top3_correct / val_total

        # ================= PRINT =================
        print(f"\nEpoch {epoch+1}")
        print(f"Loss: {total_loss/len(train_loader):.4f}")
        print(f"Train Acc: {train_acc:.4f}")
        print(f"Val Acc: {val_acc:.4f}")
        print(f"Top-3 Acc: {top3_acc:.4f}")
        print("-"*50)

    # ================= SAVE =================
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    torch.save(model.state_dict(), f"{OUTPUT_DIR}/model.pt")
    tokenizer.save_pretrained(OUTPUT_DIR)

    with open(f"{OUTPUT_DIR}/config.json","w") as f:
        json.dump({
            "id2label": id2label,
            "num_labels": len(label2id),
            "model_name": MODEL_NAME
        }, f)

    print("✅ Training Complete")

# ==========================================
# RUN
# ==========================================
if __name__ == "__main__":
    train()

    result = analyze_profile(
        "Python developer with ML, Flask, pandas, numpy, REST APIs, projects in ML",
        "Aspiring Data Scientist | ML Enthusiast",
        "Data Scientist"
    )

    print("\n===== FINAL OUTPUT =====")
    print(result)