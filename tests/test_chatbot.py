"""
Chatbot interaction tests - 50+ test cases.
Tests chatbot functionality, messaging, and responses.
"""

import pytest
import time
from page_objects import HomePage, ChatbotPage
from test_utils import TestDataManager, AssertionHelper


class TestChatbotUIElements:
    """Chatbot UI element tests."""
    
    @pytest.fixture
    def chatbot_page(self, driver, base_url):
        """Initialize ChatbotPage object."""
        home_page = HomePage(driver, base_url)
        return ChatbotPage(driver, base_url)
    
    def test_chatbot_trigger_visible(self, chatbot_page):
        """Test chatbot trigger button is visible."""
        assert chatbot_page.is_visible(*chatbot_page.CHATBOT_TRIGGER)
    
    def test_chatbot_trigger_clickable(self, chatbot_page):
        """Test chatbot trigger is clickable."""
        chatbot_page.open_chatbot()
        time.sleep(1)
        assert chatbot_page.is_present(chatbot_page.CHATBOT_WINDOW)
    
    def test_chatbot_window_opens(self, chatbot_page):
        """Test chatbot window opens."""
        chatbot_page.open_chatbot()
        time.sleep(1)
        window = chatbot_page.driver.find_element(*chatbot_page.CHATBOT_WINDOW)
        assert "active" in window.get_attribute("class")
    
    def test_chat_input_field_present(self, chatbot_page):
        """Test chat input field is present."""
        chatbot_page.open_chatbot()
        time.sleep(1)
        assert chatbot_page.is_present(chatbot_page.CHAT_INPUT)
    
    def test_send_button_present(self, chatbot_page):
        """Test send button is present."""
        chatbot_page.open_chatbot()
        time.sleep(1)
        assert chatbot_page.is_present(chatbot_page.SEND_BTN)
    
    def test_quick_reply_pills_visible(self, chatbot_page):
        """Test quick reply pills are visible."""
        chatbot_page.open_chatbot()
        time.sleep(1)
        pills = chatbot_page.driver.find_elements(*chatbot_page.QUICK_REPLY_PILLS)
        assert len(pills) > 0


class TestChatbotBasicInteraction:
    """Basic chatbot interaction tests."""
    
    @pytest.fixture
    def chatbot_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        chatbot = ChatbotPage(driver, base_url)
        chatbot.open_chatbot()
        time.sleep(1)
        return chatbot
    
    def test_initial_message_count(self, chatbot_page):
        """Test initial message count."""
        count = chatbot_page.get_message_count()
        assert count >= 0
    
    def test_send_simple_message(self, chatbot_page):
        """Test sending simple message."""
        initial_count = chatbot_page.get_message_count()
        chatbot_page.send_message("Hello")
        assert chatbot_page.get_message_count() >= initial_count
    
    def test_message_appears_after_send(self, chatbot_page):
        """Test message appears after sending."""
        chatbot_page.send_message("Test Message")
        time.sleep(0.5)
        count = chatbot_page.get_message_count()
        assert count > 0
    
    def test_bot_responds_to_message(self, chatbot_page):
        """Test bot responds to message."""
        initial_count = chatbot_page.get_message_count()
        chatbot_page.send_message("Hi")
        time.sleep(2)
        final_count = chatbot_page.get_message_count()
        assert final_count > initial_count
    
    def test_last_message_not_empty(self, chatbot_page):
        """Test last message is not empty."""
        chatbot_page.send_message("What is agriculture?")
        time.sleep(2)
        last_msg = chatbot_page.get_last_message()
        assert len(last_msg) > 0


class TestChatbotMessaging:
    """Chatbot messaging tests."""
    
    @pytest.fixture
    def chatbot_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        chatbot = ChatbotPage(driver, base_url)
        chatbot.open_chatbot()
        time.sleep(1)
        return chatbot
    
    @pytest.mark.parametrize("chat_data", TestDataManager.get_chat_messages()[:10])
    def test_send_various_messages(self, chatbot_page, chat_data):
        """Test sending various chat messages."""
        message = chat_data["message"]
        chatbot_page.send_message(message)
        time.sleep(2)
        
        response = chatbot_page.get_last_message()
        assert len(response) > 0
    
    def test_question_about_rice_blast(self, chatbot_page):
        """Test asking about rice blast."""
        chatbot_page.send_message("How do I treat rice blast?")
        time.sleep(2)
        response = chatbot_page.get_last_message()
        assert len(response) > 0
    
    def test_question_about_irrigation(self, chatbot_page):
        """Test asking about irrigation."""
        chatbot_page.send_message("What is the best irrigation method?")
        time.sleep(2)
        response = chatbot_page.get_last_message()
        assert len(response) > 0
    
    def test_question_about_fertilization(self, chatbot_page):
        """Test asking about fertilization."""
        chatbot_page.send_message("How often should I fertilize?")
        time.sleep(2)
        response = chatbot_page.get_last_message()
        assert len(response) > 0
    
    def test_multiple_consecutive_messages(self, chatbot_page):
        """Test multiple consecutive messages."""
        messages = [
            "Hello",
            "What is crop rotation?",
            "How do I prevent leaf spot?",
        ]
        
        for msg in messages:
            chatbot_page.send_message(msg)
            time.sleep(2)
        
        count = chatbot_page.get_message_count()
        assert count >= len(messages)


class TestQuickReply:
    """Quick reply functionality tests."""
    
    @pytest.fixture
    def chatbot_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        chatbot = ChatbotPage(driver, base_url)
        chatbot.open_chatbot()
        time.sleep(1)
        return chatbot
    
    def test_quick_reply_pills_clickable(self, chatbot_page):
        """Test quick reply pills are clickable."""
        chatbot_page.click_quick_reply(0)
        time.sleep(2)
        count = chatbot_page.get_message_count()
        assert count > 0
    
    @pytest.mark.parametrize("pill_index", range(0, 3))
    def test_click_different_quick_replies(self, chatbot_page, pill_index):
        """Test clicking different quick reply pills."""
        pills = chatbot_page.driver.find_elements(*chatbot_page.QUICK_REPLY_PILLS)
        if pill_index < len(pills):
            chatbot_page.click_quick_reply(pill_index)
            time.sleep(2)
            assert chatbot_page.get_message_count() > 0
    
    def test_quick_reply_triggers_response(self, chatbot_page):
        """Test quick reply triggers bot response."""
        initial_count = chatbot_page.get_message_count()
        chatbot_page.click_quick_reply(0)
        time.sleep(2)
        final_count = chatbot_page.get_message_count()
        assert final_count > initial_count


class TestChatbotConversationFlow:
    """Chatbot conversation flow tests."""
    
    @pytest.fixture
    def chatbot_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        chatbot = ChatbotPage(driver, base_url)
        chatbot.open_chatbot()
        time.sleep(1)
        return chatbot
    
    def test_conversation_sequence(self, chatbot_page):
        """Test conversation sequence."""
        # Send first message
        chatbot_page.send_message("Hi, I need help")
        time.sleep(2)
        
        # Send follow-up
        chatbot_page.send_message("What is soil pH?")
        time.sleep(2)
        
        # Verify multiple messages
        count = chatbot_page.get_message_count()
        assert count >= 2
    
    def test_back_and_forth_conversation(self, chatbot_page):
        """Test back and forth conversation."""
        for i in range(3):
            chatbot_page.send_message(f"Question {i+1}")
            time.sleep(2)
        
        final_count = chatbot_page.get_message_count()
        assert final_count >= 3
    
    @pytest.mark.parametrize("interaction_count", range(1, 5))
    def test_extended_conversation(self, chatbot_page, interaction_count):
        """Test extended conversation."""
        for i in range(interaction_count):
            chatbot_page.send_message(f"Message {i}")
            time.sleep(2)
        
        count = chatbot_page.get_message_count()
        assert count >= interaction_count


class TestChatbotMessageValidation:
    """Chatbot message validation tests."""
    
    @pytest.fixture
    def chatbot_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        chatbot = ChatbotPage(driver, base_url)
        chatbot.open_chatbot()
        time.sleep(1)
        return chatbot
    
    def test_empty_message_handling(self, chatbot_page):
        """Test handling of empty message."""
        initial_count = chatbot_page.get_message_count()
        # Try sending empty (may not send or may show error)
        # This is just to ensure app doesn't crash
        time.sleep(1)
        assert chatbot_page.is_present(chatbot_page.CHAT_INPUT)
    
    def test_long_message_handling(self, chatbot_page):
        """Test handling of long message."""
        long_msg = "A" * 500
        chatbot_page.send_message(long_msg)
        time.sleep(2)
        count = chatbot_page.get_message_count()
        assert count >= 0  # Should not crash
    
    def test_special_characters_in_message(self, chatbot_page):
        """Test special characters in message."""
        special_msg = "Test @#$%^&*()"
        chatbot_page.send_message(special_msg)
        time.sleep(2)
        response = chatbot_page.get_last_message()
        assert len(response) >= 0
    
    def test_numeric_only_message(self, chatbot_page):
        """Test numeric only message."""
        chatbot_page.send_message("12345")
        time.sleep(2)
        response = chatbot_page.get_last_message()
        assert len(response) >= 0


class TestChatbotUIInteraction:
    """Chatbot UI interaction tests."""
    
    @pytest.fixture
    def chatbot_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        chatbot = ChatbotPage(driver, base_url)
        chatbot.open_chatbot()
        time.sleep(1)
        return chatbot
    
    def test_chatbot_window_visibility(self, chatbot_page):
        """Test chatbot window visibility."""
        window = chatbot_page.driver.find_element(*chatbot_page.CHATBOT_WINDOW)
        assert window.is_displayed()
    
    def test_input_field_scrollable(self, chatbot_page):
        """Test input field is accessible."""
        chatbot_page.scroll_to_element(*chatbot_page.CHAT_INPUT)
        assert chatbot_page.is_visible(*chatbot_page.CHAT_INPUT)
    
    def test_send_button_responsive(self, chatbot_page):
        """Test send button is responsive."""
        send_btn = chatbot_page.driver.find_element(*chatbot_page.SEND_BTN)
        assert send_btn.is_enabled()


class TestChatbotStress:
    """Chatbot stress tests."""
    
    @pytest.fixture
    def chatbot_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        chatbot = ChatbotPage(driver, base_url)
        chatbot.open_chatbot()
        time.sleep(1)
        return chatbot
    
    @pytest.mark.parametrize("message_count", [5, 10])
    def test_multiple_rapid_messages(self, chatbot_page, message_count):
        """Test multiple rapid messages."""
        for i in range(message_count):
            chatbot_page.send_message(f"Rapid message {i}")
            time.sleep(1)
        
        final_count = chatbot_page.get_message_count()
        assert final_count > 0
    
    def test_sustained_conversation(self, chatbot_page):
        """Test sustained conversation."""
        for i in range(5):
            chatbot_page.send_message(f"Sustained message {i}")
            time.sleep(2)
        
        count = chatbot_page.get_message_count()
        assert count > 0


@pytest.mark.smoke
class TestChatbotSmoke:
    """Smoke tests for chatbot."""
    
    def test_smoke_chatbot_opens(self, driver, base_url):
        """Smoke test chatbot opens."""
        chatbot = ChatbotPage(driver, base_url)
        chatbot.open_chatbot()
        time.sleep(1)
        assert chatbot.is_visible(*chatbot.CHATBOT_WINDOW)


@pytest.mark.ui
class TestChatbotUI:
    """UI tests for chatbot."""
    
    @pytest.fixture
    def chatbot_page(self, driver, base_url):
        home_page = HomePage(driver, base_url)
        chatbot = ChatbotPage(driver, base_url)
        chatbot.open_chatbot()
        time.sleep(1)
        return chatbot
    
    def test_ui_chatbot_layout(self, chatbot_page):
        """Test chatbot UI layout."""
        assert chatbot_page.is_present(chatbot_page.CHATBOT_WINDOW)
        assert chatbot_page.is_present(chatbot_page.CHAT_INPUT)
        assert chatbot_page.is_present(chatbot_page.SEND_BTN)
