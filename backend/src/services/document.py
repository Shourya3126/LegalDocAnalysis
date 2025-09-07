import PyPDF2
import spacy

class DocumentProcessor:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")

    def extract_text(self, file):
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text

    def extract_clause(self, text: str, clause_type: str):
        doc = self.nlp(text)
        # Simplified clause extraction (extend with regex/NLP rules)
        for sent in doc.sents:
            if clause_type.lower() in sent.text.lower():
                return sent.text
        return "Clause not found"