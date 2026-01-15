import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
from datetime import datetime, timedelta

from backend.microservices.recurring_service import RecurringTaskService
from backend.microservices.notification_service import NotificationService
from backend.microservices.models import TaskEvent, RecurrencePattern
from backend.microservices.recurrence_logic import RecurrenceProcessor
from backend.microservices.utils import calculate_next_due_date


@pytest.fixture
def mock_dapr_client():
    """Mock Dapr client for testing"""
    with patch('backend.microservices.dapr_client.DaprClientWrapper') as mock:
        yield mock


@pytest.fixture
def recurring_service():
    """Create a recurring task service instance for testing"""
    service = RecurringTaskService()
    return service


@pytest.fixture
def notification_service():
    """Create a notification service instance for testing"""
    service = NotificationService()
    return service


class TestRecurringTaskGeneration:
    """Test cases for recurring task generation functionality"""

    @pytest.mark.asyncio
    async def test_daily_recurrence_calculation(self):
        """Test daily recurrence pattern calculation"""
        current_date = datetime(2026, 1, 14, 10, 0, 0)
        next_date = calculate_next_due_date(current_date, RecurrencePattern.DAILY)

        expected_date = datetime(2026, 1, 15, 10, 0, 0)
        assert next_date == expected_date

    @pytest.mark.asyncio
    async def test_weekly_recurrence_calculation(self):
        """Test weekly recurrence pattern calculation"""
        current_date = datetime(2026, 1, 14, 10, 0, 0)  # Wednesday
        next_date = calculate_next_due_date(current_date, RecurrencePattern.WEEKLY)

        expected_date = datetime(2026, 1, 21, 10, 0, 0)  # Next Wednesday
        assert next_date == expected_date

    @pytest.mark.asyncio
    async def test_monthly_recurrence_calculation(self):
        """Test monthly recurrence pattern calculation"""
        current_date = datetime(2026, 1, 14, 10, 0, 0)
        next_date = calculate_next_due_date(current_date, RecurrencePattern.MONTHLY)

        expected_date = datetime(2026, 2, 14, 10, 0, 0)
        assert next_date == expected_date

    @pytest.mark.asyncio
    async def test_monthly_recurrence_edge_case(self):
        """Test monthly recurrence with month-end edge case"""
        # January 31st to February (which doesn't have 31 days)
        current_date = datetime(2026, 1, 31, 10, 0, 0)
        next_date = calculate_next_due_date(current_date, RecurrencePattern.MONTHLY)

        # Should go to February 28th (or 29th in leap year)
        expected_date = datetime(2026, 2, 28, 10, 0, 0)
        assert next_date == expected_date

    @pytest.mark.asyncio
    async def test_handle_task_completed_valid_recurrence(self, recurring_service, mock_dapr_client):
        """Test handling a task-completed event with valid recurrence pattern"""
        # Mock event data
        event_data = {
            'event_id': 'test_event_1',
            'task_id': 123,
            'user_id': 456,
            'payload': {
                'recurrence_pattern': 'daily'
            }
        }

        # Mock the database session and task lookup
        with patch('backend.microservices.recurring_service.get_db_session') as mock_session:
            mock_db = Mock()
            mock_task = Mock()
            mock_task.id = 123
            mock_task.title = "Test Task"
            mock_task.description = "Test Description"
            mock_task.due_date = datetime(2026, 1, 14)
            mock_task.recurrence_pattern = 'daily'
            mock_task.user_id = 456

            mock_db.__enter__.return_value = mock_db
            mock_db.query.return_value.filter.return_value.first.return_value = mock_task
            mock_session.return_value = mock_db

            # Mock the Dapr client for publishing events
            mock_dapr_instance = AsyncMock()
            mock_dapr_instance.__aenter__.return_value = mock_dapr_instance
            mock_dapr_instance.publish_event.return_value = True
            mock_dapr_client.return_value = mock_dapr_instance

            # Mock the idempotency check
            with patch.object(recurring_service, 'is_event_processed', return_value=False):
                with patch.object(recurring_service, 'mark_processed_event'):
                    result = await recurring_service.handle_task_completed(
                        event_data, 'task-events', 'pubsub', {}
                    )

                    assert result['status'] == 'processed'
                    assert 'result' in result

    @pytest.mark.asyncio
    async def test_handle_task_completed_no_recurrence(self, recurring_service):
        """Test handling a task-completed event with no recurrence pattern"""
        event_data = {
            'event_id': 'test_event_2',
            'task_id': 123,
            'user_id': 456,
            'payload': {}  # No recurrence pattern
        }

        result = await recurring_service.handle_task_completed(
            event_data, 'task-events', 'pubsub', {}
        )

        assert result['status'] == 'skipped'
        assert result['reason'] == 'no_recurrence_pattern'

    @pytest.mark.asyncio
    async def test_handle_task_completed_invalid_recurrence(self, recurring_service):
        """Test handling a task-completed event with invalid recurrence pattern"""
        event_data = {
            'event_id': 'test_event_3',
            'task_id': 123,
            'user_id': 456,
            'payload': {
                'recurrence_pattern': 'invalid_pattern'
            }
        }

        result = await recurring_service.handle_task_completed(
            event_data, 'task-events', 'pubsub', {}
        )

        assert result['status'] == 'error'
        assert result['reason'] == 'invalid_recurrence_pattern'


class TestNotificationService:
    """Test cases for notification service functionality"""

    @pytest.mark.asyncio
    async def test_format_notification_message_under_hour(self):
        """Test notification message formatting for less than an hour"""
        from backend.microservices.utils import format_notification_message

        message = format_notification_message("Test Task", 30)
        assert "30 minutes" in message
        assert "Test Task" in message

    @pytest.mark.asyncio
    async def test_format_notification_message_over_hour(self):
        """Test notification message formatting for over an hour"""
        from backend.microservices.utils import format_notification_message

        message = format_notification_message("Test Task", 120)  # 2 hours
        assert "2 hours" in message
        assert "Test Task" in message

    @pytest.mark.asyncio
    async def test_scan_and_send_notifications(self, notification_service, mock_dapr_client):
        """Test scanning and sending notifications for upcoming tasks"""
        # This test would require mocking the database session and task retrieval
        # For now, we'll test that the method can be called without error
        with patch('backend.microservices.notification_service.get_db_session') as mock_session:
            mock_db = Mock()
            mock_db.__enter__.return_value = mock_db
            mock_db.query.return_value.filter.return_value.all.return_value = []  # No tasks

            mock_session.return_value = mock_db

            # Mock the Dapr client
            mock_dapr_instance = AsyncMock()
            mock_dapr_instance.__aenter__.return_value = mock_dapr_instance
            mock_dapr_instance.publish_event.return_value = True
            mock_dapr_client.return_value = mock_dapr_instance

            # Mock the idempotency check
            with patch.object(notification_service, 'mark_processed_event'):
                # Call the method - it should not raise an exception
                await notification_service.scan_and_send_notifications()


class TestReliabilityFeatures:
    """Test cases for reliability features"""

    @pytest.mark.asyncio
    async def test_retry_decorator_success(self):
        """Test that the retry decorator works when function succeeds"""
        from backend.microservices.reliability import retry_with_backoff

        # Create a function that succeeds on the first try
        call_count = 0

        @retry_with_backoff(max_attempts=3, base_delay=0.01, max_delay=0.1)
        async def test_func():
            nonlocal call_count
            call_count += 1
            return "success"

        result = await test_func()
        assert result == "success"
        assert call_count == 1

    @pytest.mark.asyncio
    async def test_retry_decorator_eventually_succeeds(self):
        """Test that the retry decorator works when function succeeds after retries"""
        from backend.microservices.reliability import retry_with_backoff

        # Create a function that fails twice then succeeds
        call_count = 0

        @retry_with_backoff(max_attempts=3, base_delay=0.01, max_delay=0.1)
        async def test_func():
            nonlocal call_count
            call_count += 1
            if call_count < 3:
                raise Exception("Simulated failure")
            return "success"

        result = await test_func()
        assert result == "success"
        assert call_count == 3

    @pytest.mark.asyncio
    async def test_retry_decorator_fails_after_max_attempts(self):
        """Test that the retry decorator fails after max attempts"""
        from backend.microservices.reliability import retry_with_backoff

        # Create a function that always fails
        call_count = 0

        @retry_with_backoff(max_attempts=3, base_delay=0.01, max_delay=0.1)
        async def test_func():
            nonlocal call_count
            call_count += 1
            raise Exception("Always fails")

        with pytest.raises(Exception, match="Always fails"):
            await test_func()

        assert call_count == 3


if __name__ == "__main__":
    pytest.main([__file__])