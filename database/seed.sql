-- GlobeTrotter Seed Data

-- Insert sample cities
INSERT INTO cities (name, country, region, cost_index, popularity_score, description, image_url) VALUES
('Paris', 'France', 'Europe', 75, 95, 'The City of Light, known for its art, fashion, and culture', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34'),
('Tokyo', 'Japan', 'Asia', 80, 90, 'A vibrant metropolis blending tradition and modernity', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'),
('New York', 'USA', 'North America', 85, 92, 'The city that never sleeps, a global hub of culture and commerce', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9'),
('London', 'UK', 'Europe', 80, 88, 'Historic capital with royal palaces and world-class museums', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad'),
('Barcelona', 'Spain', 'Europe', 65, 85, 'Mediterranean gem with stunning architecture and beaches', 'https://images.unsplash.com/photo-1583422409516-2895a77efded'),
('Dubai', 'UAE', 'Middle East', 90, 87, 'Futuristic city with luxury shopping and ultramodern architecture', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c'),
('Rome', 'Italy', 'Europe', 70, 89, 'The Eternal City, home to ancient ruins and Renaissance art', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5'),
('Bangkok', 'Thailand', 'Asia', 45, 83, 'Vibrant street life, ornate shrines, and bustling markets', 'https://images.unsplash.com/photo-1508009603885-50cf7c579365'),
('Sydney', 'Australia', 'Oceania', 75, 86, 'Harbor city with iconic Opera House and beautiful beaches', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9'),
('Amsterdam', 'Netherlands', 'Europe', 70, 84, 'Artistic heritage, canal system, and cycling culture', 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017'),
('Singapore', 'Singapore', 'Asia', 85, 88, 'Modern city-state with diverse culture and cuisine', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd'),
('Istanbul', 'Turkey', 'Europe/Asia', 55, 82, 'Where East meets West, rich in history and culture', 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200'),
('Bali', 'Indonesia', 'Asia', 40, 87, 'Tropical paradise with beaches, temples, and rice terraces', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4'),
('Prague', 'Czech Republic', 'Europe', 50, 81, 'Fairy-tale city with Gothic architecture and medieval charm', 'https://images.unsplash.com/photo-1541849546-216549ae216d'),
('Santorini', 'Greece', 'Europe', 70, 90, 'Stunning island with white-washed buildings and blue domes', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff');

-- Insert sample activities for Paris
INSERT INTO activities (name, city_id, category, cost, duration, description, image_url) VALUES
('Eiffel Tower Visit', 1, 'Sightseeing', 25.00, 120, 'Visit the iconic Eiffel Tower with stunning city views', 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f'),
('Louvre Museum Tour', 1, 'Culture', 17.00, 180, 'Explore the world''s largest art museum', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a'),
('Seine River Cruise', 1, 'Leisure', 15.00, 60, 'Romantic boat ride along the Seine', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34'),
('Montmartre Walking Tour', 1, 'Sightseeing', 20.00, 150, 'Discover the artistic heart of Paris', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34'),
('French Cooking Class', 1, 'Food', 85.00, 180, 'Learn to cook authentic French cuisine', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d');

-- Insert sample activities for Tokyo
INSERT INTO activities (name, city_id, category, cost, duration, description, image_url) VALUES
('Senso-ji Temple Visit', 2, 'Culture', 0.00, 90, 'Tokyo''s oldest and most significant temple', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9'),
('Shibuya Crossing Experience', 2, 'Sightseeing', 0.00, 30, 'Experience the world''s busiest pedestrian crossing', 'https://images.unsplash.com/photo-1542051841857-5f90071e7989'),
('Sushi Making Class', 2, 'Food', 75.00, 120, 'Learn the art of sushi from a master chef', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351'),
('Tokyo Skytree Observation', 2, 'Sightseeing', 28.00, 90, 'Panoramic views from Japan''s tallest structure', 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc'),
('Tsukiji Fish Market Tour', 2, 'Food', 45.00, 120, 'Explore the famous fish market and taste fresh seafood', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5');

-- Insert sample activities for New York
INSERT INTO activities (name, city_id, category, cost, duration, description, image_url) VALUES
('Statue of Liberty Tour', 3, 'Sightseeing', 23.00, 180, 'Visit the iconic symbol of freedom', 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74'),
('Central Park Bike Tour', 3, 'Leisure', 35.00, 120, 'Explore the urban oasis on two wheels', 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90'),
('Broadway Show', 3, 'Entertainment', 120.00, 150, 'Experience world-class theater', 'https://images.unsplash.com/photo-1503095396549-807759245b35'),
('Metropolitan Museum Tour', 3, 'Culture', 25.00, 180, 'Discover art spanning 5,000 years', 'https://images.unsplash.com/photo-1564399579883-451a5d44ec08'),
('Brooklyn Bridge Walk', 3, 'Sightseeing', 0.00, 60, 'Walk across the historic suspension bridge', 'https://images.unsplash.com/photo-1543716091-a840c05249ec');

-- Insert sample activities for London
INSERT INTO activities (name, city_id, category, cost, duration, description, image_url) VALUES
('Tower of London Tour', 4, 'Culture', 30.00, 150, 'Explore 1,000 years of history and see the Crown Jewels', 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383'),
('British Museum Visit', 4, 'Culture', 0.00, 180, 'World-famous museum with vast collections', 'https://images.unsplash.com/photo-1543783207-ec64e4d95325'),
('Thames River Cruise', 4, 'Leisure', 18.00, 60, 'See London''s landmarks from the water', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad'),
('West End Theatre Show', 4, 'Entertainment', 85.00, 150, 'Enjoy a spectacular musical or play', 'https://images.unsplash.com/photo-1503095396549-807759245b35'),
('Afternoon Tea Experience', 4, 'Food', 45.00, 90, 'Traditional British afternoon tea', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d');

-- Insert sample activities for Barcelona
INSERT INTO activities (name, city_id, category, cost, duration, description, image_url) VALUES
('Sagrada Familia Tour', 5, 'Culture', 26.00, 120, 'Visit Gaudí''s masterpiece basilica', 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216'),
('Park Güell Visit', 5, 'Sightseeing', 10.00, 90, 'Explore Gaudí''s colorful park with city views', 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b'),
('Gothic Quarter Walking Tour', 5, 'Culture', 15.00, 120, 'Discover medieval streets and Roman ruins', 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b'),
('Beach Day at Barceloneta', 5, 'Leisure', 0.00, 180, 'Relax on Barcelona''s famous beach', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19'),
('Tapas Food Tour', 5, 'Food', 65.00, 180, 'Taste authentic Spanish tapas', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1');

-- Insert sample activities for Dubai
INSERT INTO activities (name, city_id, category, cost, duration, description, image_url) VALUES
('Burj Khalifa Observation', 6, 'Sightseeing', 40.00, 90, 'Visit the world''s tallest building', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c'),
('Desert Safari', 6, 'Adventure', 75.00, 240, 'Dune bashing, camel riding, and BBQ dinner', 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3'),
('Dubai Mall Shopping', 6, 'Shopping', 0.00, 180, 'Explore one of the world''s largest malls', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8'),
('Dubai Marina Cruise', 6, 'Leisure', 35.00, 120, 'Dinner cruise with stunning skyline views', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5'),
('Gold Souk Visit', 6, 'Shopping', 0.00, 60, 'Browse traditional gold market', 'https://images.unsplash.com/photo-1610375461246-83df859d849d');

-- Insert sample activities for Rome
INSERT INTO activities (name, city_id, category, cost, duration, description, image_url) VALUES
('Colosseum Tour', 7, 'Culture', 16.00, 120, 'Explore the iconic ancient amphitheater', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5'),
('Vatican Museums & Sistine Chapel', 7, 'Culture', 17.00, 180, 'See Michelangelo''s masterpiece and papal collections', 'https://images.unsplash.com/photo-1531572753322-ad063cecc140'),
('Trevi Fountain Visit', 7, 'Sightseeing', 0.00, 30, 'Toss a coin in Rome''s most famous fountain', 'https://images.unsplash.com/photo-1525874684015-58379d421a52'),
('Roman Forum Walk', 7, 'Culture', 12.00, 90, 'Walk through ancient Rome''s center', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5'),
('Italian Cooking Class', 7, 'Food', 80.00, 180, 'Learn to make pasta and tiramisu', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d');

-- Insert sample activities for Bangkok
INSERT INTO activities (name, city_id, category, cost, duration, description, image_url) VALUES
('Grand Palace Visit', 8, 'Culture', 15.00, 120, 'Explore Thailand''s most sacred temple complex', 'https://images.unsplash.com/photo-1563492065599-3520f775eeed'),
('Floating Market Tour', 8, 'Culture', 25.00, 180, 'Experience traditional Thai market on water', 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a'),
('Thai Massage', 8, 'Wellness', 20.00, 90, 'Traditional Thai massage experience', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874'),
('Street Food Tour', 8, 'Food', 30.00, 180, 'Taste authentic Thai street food', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1'),
('Wat Arun Temple', 8, 'Culture', 3.00, 60, 'Visit the Temple of Dawn', 'https://images.unsplash.com/photo-1563492065599-3520f775eeed');

-- Create a demo user (password: demo123)
INSERT INTO users (email, password_hash, first_name, last_name, phone, city, country, is_admin) VALUES
('demo@globetrotter.com', '$2b$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx', 'Demo', 'User', '+1234567890', 'New York', 'USA', false),
('admin@globetrotter.com', '$2b$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx', 'Admin', 'User', '+1234567890', 'San Francisco', 'USA', true);
