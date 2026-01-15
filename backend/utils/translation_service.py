"""
Translation Utility for Multi-language Support
Supports English and Urdu translations
"""

from typing import Dict, Optional
import re

class TranslationService:
    """
    Simple translation service for Urdu-English support
    
    Features:
    - Language detection
    - Basic phrase translation
    - No external API required (uses local dictionary)
    """
    
    # ✅ Urdu to English Mapping
    URDU_TO_ENGLISH = {
        # Greetings
        "سلام": "hello",
        "السلام علیکم": "hello",
        "خدا حافظ": "goodbye",
        "شکریہ": "thank you",
        "جی ہاں": "yes",
        "نہیں": "no",
        
        # Task Actions
        "کام شامل کریں": "add task",
        "کام بنائیں": "create task", 
        "کام دکھائیں": "show tasks",
        "کام حذف کریں": "delete task",
        "کام ختم کریں": "complete task",
        "نیا کام": "new task",
        "میرے کام": "my tasks",
        
        # Task Properties
        "عنوان": "title",
        "تفصیل": "description",
        "ترجیح": "priority",
        "اہم": "high",
        "درمیانی": "medium",
        "کم": "low",
        "مکمل": "completed",
        "زیر التواء": "pending",
        
        # Common Verbs
        "شامل کریں": "add",
        "بنائیں": "create",
        "دکھائیں": "show",
        "حذف کریں": "delete",
        "ختم کریں": "complete",
        "تبدیل کریں": "update",
        "تلاش کریں": "search",
        
        # Time
        "آج": "today",
        "کل": "tomorrow",
        "اب": "now",
        "بعد میں": "later",
    }
    
    # ✅ English to Urdu Mapping (for responses)
    ENGLISH_TO_URDU = {
        # Task confirmations
        "task added": "کام شامل ہو گیا",
        "task created": "کام بن گیا",
        "task deleted": "کام حذف ہو گیا",
        "task completed": "کام مکمل ہو گیا",
        "task updated": "کام اپ ڈیٹ ہو گیا",
        
        # Success messages
        "success": "کامیاب",
        "done": "ہو گیا",
        "completed": "مکمل",
        
        # Error messages
        "error": "خرابی",
        "failed": "ناکام",
        "not found": "نہیں ملا",
        
        # Task properties
        "high priority": "اہم ترجیح",
        "medium priority": "درمیانی ترجیح",
        "low priority": "کم ترجیح",
        "pending": "زیر التواء",
        
        # Greetings
        "hello": "السلام علیکم",
        "welcome": "خوش آمدید",
        "thank you": "شکریہ",
        "goodbye": "خدا حافظ",
        
        # Common phrases
        "you have": "آپ کے پاس",
        "tasks": "کام",
        "no tasks": "کوئی کام نہیں",
    }
    
    @staticmethod
    def detect_language(text: str) -> str:
        """
        Detect if text is in Urdu or English
        
        Args:
            text: Input text
            
        Returns:
            'ur' for Urdu, 'en' for English
        """
        # Check for Urdu Unicode characters (U+0600 to U+06FF)
        urdu_pattern = re.compile(r'[\u0600-\u06FF]')
        
        if urdu_pattern.search(text):
            return 'ur'
        return 'en'
    
    @staticmethod
    def translate_to_english(urdu_text: str) -> str:
        """
        Translate Urdu text to English
        
        Args:
            urdu_text: Text in Urdu
            
        Returns:
            Translated English text
        """
        text_lower = urdu_text.strip()
        
        # Try exact match first
        if text_lower in TranslationService.URDU_TO_ENGLISH:
            return TranslationService.URDU_TO_ENGLISH[text_lower]
        
        # Try word-by-word translation
        words = text_lower.split()
        translated_words = []
        
        for word in words:
            if word in TranslationService.URDU_TO_ENGLISH:
                translated_words.append(TranslationService.URDU_TO_ENGLISH[word])
            else:
                translated_words.append(word)  # Keep original if no translation
        
        return ' '.join(translated_words)
    
    @staticmethod
    def translate_to_urdu(english_text: str) -> str:
        """
        Translate English text to Urdu
        
        Args:
            english_text: Text in English
            
        Returns:
            Translated Urdu text
        """
        text_lower = english_text.lower().strip()
        
        # Try exact match first
        if text_lower in TranslationService.ENGLISH_TO_URDU:
            return TranslationService.ENGLISH_TO_URDU[text_lower]
        
        # Try partial matches for phrases
        for eng_phrase, urdu_phrase in TranslationService.ENGLISH_TO_URDU.items():
            if eng_phrase in text_lower:
                text_lower = text_lower.replace(eng_phrase, urdu_phrase)
        
        return text_lower
    
    @staticmethod
    def get_system_prompt_for_language(language: str) -> str:
        """
        Get appropriate system prompt based on language
        
        Args:
            language: 'en' or 'ur'
            
        Returns:
            System prompt in the specified language
        """
        if language == 'ur':
            return """آپ ایک دوستانہ اور پیشہ ورانہ AI ٹاسک اسسٹنٹ ہیں۔

جوابات مختصر (100 الفاظ سے کم)، مددگار اور قدرتی رکھیں۔

آپ کی صلاحیتیں:
- کام بنانا: "کام شامل کریں [نام]"
- کام دکھانا: "میرے کام دکھائیں"
- کام حذف کرنا: "حذف کریں [کام کا نام]"
- کام مکمل کرنا: "مکمل کریں [کام کا نام]"

دوستانہ لیکن پیشہ ورانہ رہیں۔"""
        
        # Default English
        return """You are Task Buddy, a friendly and professional AI task assistant.

Keep responses SHORT (under 100 words), HELPFUL, and NATURAL.

Your capabilities:
- Create tasks: "add task [name]"
- Show tasks: "show my tasks"  
- Delete tasks: "remove [task name]"
- Complete tasks: "mark [task name] as done"

Be friendly but professional. No excessive emojis or encouragement."""


# ✅ Example Usage Functions
def example_usage():
    """Examples of how to use TranslationService"""
    
    # Detect language
    text1 = "سلام، میرے کام دکھائیں"
    lang1 = TranslationService.detect_language(text1)
    print(f"Language detected: {lang1}")  # Output: ur
    
    # Translate Urdu to English
    english = TranslationService.translate_to_english("کام شامل کریں")
    print(f"Translated to English: {english}")  # Output: add task
    
    # Translate English to Urdu
    urdu = TranslationService.translate_to_urdu("task added")
    print(f"Translated to Urdu: {urdu}")  # Output: کام شامل ہو گیا
    
    # Get system prompt
    prompt_ur = TranslationService.get_system_prompt_for_language('ur')
    print(f"Urdu system prompt: {prompt_ur}")


if __name__ == "__main__":
    example_usage()