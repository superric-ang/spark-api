-- Values quiz questions
INSERT INTO quiz_answers (user_id, question_id, question_text, answer_value, answer_weight) VALUES
-- This is just a template; actual seeding would be done per user
-- But for demo, we can insert sample questions as a reference

-- Sample events in Singapore
INSERT INTO events (title, description, location_name, location, city, event_date, price, max_attendees, image_url) VALUES
('Speed Dating Night', 'Meet 10 potential matches in 2 hours with guided conversations', 'The Tipsy Coworker', ST_GeomFromText('POINT(103.851959 1.290270)', 4326), 'Singapore', '2024-06-15 19:00:00', 25.00, 50, 'https://example.com/event1.jpg'),
('Hiking Meetup', 'Explore MacRitchie Reservoir trails and connect with fellow outdoor enthusiasts', 'MacRitchie Reservoir Park', ST_GeomFromText('POINT(103.834000 1.344000)', 4326), 'Singapore', '2024-06-22 08:00:00', 0.00, 30, 'https://example.com/event2.jpg'),
('Wine Tasting Social', 'Sample local wines and mingle with wine lovers', 'Wine Connection', ST_GeomFromText('POINT(103.845000 1.302000)', 4326), 'Singapore', '2024-06-29 18:30:00', 45.00, 40, 'https://example.com/event3.jpg'),
('Karaoke Night', 'Sing your heart out and meet people with similar music tastes', 'KBox', ST_GeomFromText('POINT(103.848000 1.299000)', 4326), 'Singapore', '2024-07-06 20:00:00', 15.00, 25, 'https://example.com/event4.jpg'),
('Cooking Class', 'Learn to make authentic laksa and bond over food', 'The Cooking Academy', ST_GeomFromText('POINT(103.850000 1.295000)', 4326), 'Singapore', '2024-07-13 10:00:00', 35.00, 20, 'https://example.com/event5.jpg');

-- Sample bio prompts (this would be a separate table in production)
-- For now, we'll store them as JSON in the app or hardcode