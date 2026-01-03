
-- Insert some sample trips to link activities
INSERT INTO trips (user_id, name, start_date, end_date, total_cost, status) VALUES 
((SELECT id FROM users WHERE email = 'demo@globetrotter.com'), 'Paris Getaway', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '15 days', 2500.00, 'planning'),
((SELECT id FROM users WHERE email = 'demo@globetrotter.com'), 'Tokyo Adventure', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '40 days', 4500.00, 'planning');

-- Insert trip stops
INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, budget, name) VALUES
((SELECT id FROM trips WHERE name = 'Paris Getaway'), (SELECT id FROM cities WHERE name = 'Paris'), CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '15 days', 1000.00, 'Paris Leg'),
((SELECT id FROM trips WHERE name = 'Tokyo Adventure'), (SELECT id FROM cities WHERE name = 'Tokyo'), CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '40 days', 2000.00, 'Tokyo Leg');

-- Insert stop activities (This populates the Popular Activities chart)
INSERT INTO stop_activities (stop_id, activity_id, cost, status) VALUES
-- Paris Activities
((SELECT id FROM trip_stops WHERE name = 'Paris Leg'), (SELECT id FROM activities WHERE name = 'Eiffel Tower Visit'), 25.00, 'planned'),
((SELECT id FROM trip_stops WHERE name = 'Paris Leg'), (SELECT id FROM activities WHERE name = 'Louvre Museum Tour'), 17.00, 'planned'),
((SELECT id FROM trip_stops WHERE name = 'Paris Leg'), (SELECT id FROM activities WHERE name = 'Seine River Cruise'), 15.00, 'planned'),
-- Tokyo Activities
((SELECT id FROM trip_stops WHERE name = 'Tokyo Leg'), (SELECT id FROM activities WHERE name = 'Senso-ji Temple Visit'), 0.00, 'planned'),
((SELECT id FROM trip_stops WHERE name = 'Tokyo Leg'), (SELECT id FROM activities WHERE name = 'Sushi Making Class'), 75.00, 'planned');
