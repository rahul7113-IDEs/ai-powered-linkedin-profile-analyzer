import unittest
from profile_analyzer import ProfileAnalyzer

class TestProfileAnalyzer(unittest.TestCase):
    def setUp(self):
        self.analyzer = ProfileAnalyzer("backend developer")

    def test_skill_extraction_no_false_positives(self):
        # "java" in "javascript" should not trigger a match since backend developer has "java" (wait, backend developer has python, django, fastapi, sql, postgreSQL, ... but no java in the dictionary. Let's test with a skill that could be a substring)
        # In our dictionary, Backend Developer has "REST API" and "API", wait, "API" is not there, "REST API" is.
        # Let's test "script" vs "javascript". Our regex uses \b, so it shouldn't match.
        text = "I love programming in javascript and writing manuscript."
        # Temporarily inject a target skill to test regex boundaries
        self.analyzer.target_skills = ["java", "script", "REST"]
        skills = self.analyzer._extract_skills(text)
        self.assertNotIn("java", skills)
        self.assertNotIn("script", skills)
        
        # Test exact match
        text_exact = "I use java for backend and REST APIs."
        skills_exact = self.analyzer._extract_skills(text_exact)
        self.assertIn("java", skills_exact)
        self.assertIn("REST", skills_exact)

    def test_semantic_similarity(self):
        # Python Developer vs Resume with Python should be high
        resume = "Experienced Python Developer with deep knowledge of Django, FastAPI, and PostgreSQL."
        linkedin = "Backend Engineer building scalable microservices in Python."
        
        analyzer_py = ProfileAnalyzer("backend developer")
        similarity = analyzer_py._compute_semantic_similarity(resume, linkedin)
        
        # Since 'backend developer' targets Python, Django, FastAPI, etc., it should be > 0.5 at least
        self.assertGreater(similarity, 0.4)
        
        # Something completely unrelated should be lower
        resume_unrelated = "Professional chef with 5 years experience in French cuisine."
        linkedin_unrelated = "Culinary artist passionate about food."
        similarity_unrelated = analyzer_py._compute_semantic_similarity(resume_unrelated, linkedin_unrelated)
        
        self.assertLess(similarity_unrelated, similarity)
        
    def test_output_schema(self):
        resume = "Backend Developer with Python."
        linkedin = "Python expert."
        result = self.analyzer.analyze(resume, linkedin)
        
        self.assertIn("ATS Score", result)
        self.assertIn("Skill Match %", result)
        self.assertIn("Missing Skills", result)
        self.assertIn("Suggestions", result)
        self.assertIn("Semantic Similarity Score", result)
        
        self.assertIsInstance(result["ATS Score"], float)
        self.assertIsInstance(result["Skill Match %"], float)
        self.assertIsInstance(result["Missing Skills"], list)
        self.assertIsInstance(result["Suggestions"], list)
        self.assertIsInstance(result["Semantic Similarity Score"], float)

if __name__ == "__main__":
    unittest.main()
