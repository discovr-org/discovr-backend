-- Goan fish thali shortlist: Bombil, Vinayak, Kokni Kanteen, Ritz Classic Panjim.
-- Safe to re-run for these slugs.

delete from experiences
where slug in ('bombil', 'vinayak-family-restaurant', 'kokni-kanteen', 'ritz-classic-panjim');

delete from hosts
where id in (
  '11111111-1111-4111-8111-111111111201',
  '11111111-1111-4111-8111-111111111202',
  '11111111-1111-4111-8111-111111111203',
  '11111111-1111-4111-8111-111111111204'
);

insert into hosts (id, business_name, person_name, phone_e164, verified, languages)
values
  ('11111111-1111-4111-8111-111111111201', 'Bombil', 'Reservations team', '+919823291413', false, '{}'),
  ('11111111-1111-4111-8111-111111111202', 'Vinayak Family Restaurant', 'Reservations team', '+919049380518', false, '{}'),
  ('11111111-1111-4111-8111-111111111203', 'Kokni Kanteen', 'Reservations team', '+919579275664', false, '{}'),
  ('11111111-1111-4111-8111-111111111204', 'Ritz Classic Panjim', 'Reservations team', '+918322426417', false, '{}');

insert into experiences (
  id, slug, title, status, host_id, verdict, about,
  duration_minutes, group_size_max, group_size_label,
  place_name, place_neighborhood, place_lat, place_lng,
  price_from_inr, price_ask, price_paid_to,
  schedule, policy, content,
  published_at
) values
(
  '22222222-2222-4222-8222-222222222301',
  'bombil',
  'Bombil',
  'published',
  '11111111-1111-4111-8111-111111111201',
  'Jo missed his old family haunts. So he built one.',
  'Jo missed the small Goan eateries he used to visit with his father, so he created Bombil. Come for a homestyle thali built around the day’s fish, local curries and house pickles. Get there early for lunch. The tables fill quickly.',
  90,
  8,
  'Come solo, as a couple, with friends or with family.',
  'Bombil',
  'Campal, Panaji',
  15.4967,
  73.8196,
  500,
  false,
  'paid to the venue',
  '{"days":"Daily","timeSlot":"Lunch from noon; dinner from 7:30 PM.","bestTime":"Go when lunch opens, around noon, to get ahead of the queue.","ageGroup":"All ages. Alcohol service is subject to age restrictions.","minPeople":"1 for normal dining"}'::jsonb,
  '{"summary":"Walk-in seating. Fish availability changes daily.","booking":["Expect a lunch queue. Fish choices change with the catch.","Seating is walk-in."],"cancellation":[]}'::jsonb,
  '{"priceNarrative":"Approx. ₹500–₹1,000","priceUnit":"For two; your fish selection affects the bill.","meetingPoint":"Bombil, Shops 20 and 23, Gurudutta Apartments, opposite Don Bosco School, Campal, Panaji","phones":["+91 98232 91413"],"included":["Seating and table service. Food and drinks charged separately."],"notIncluded":["Food, drinks, taxes and any booking extras"],"faqs":[{"q":"What should I order?","a":"A fish thali with the day’s available catch."},{"q":"Can I reserve?","a":"Seating is walk-in."},{"q":"When should I arrive?","a":"Around noon for lunch."}],"menuLabel":"Menu","mapsLabel":"Map"}'::jsonb,
  now()
),
(
  '22222222-2222-4222-8222-222222222302',
  'vinayak-family-restaurant',
  'Vinayak Family Restaurant',
  'published',
  '11111111-1111-4111-8111-111111111202',
  'A family kitchen and a thali that keeps Assagao coming back.',
  'A family kitchen, a view of the paddy fields and a thali that brings people back to Assagao. Vinayak keeps things simple: Goan seafood, local flavours and generous plates. Arrive before the lunch rush and take your time with the meal.',
  90,
  8,
  'Come solo, as a couple, with friends or with family.',
  'Vinayak Family Restaurant',
  'Assagao, North Goa',
  15.5937,
  73.7647,
  390,
  false,
  'paid to the venue',
  '{"days":"Monday–Wednesday and Friday–Sunday. Closed Thursday.","timeSlot":"Lunch: around noon–4:30 PM. Dinner: around 7–11 PM.","bestTime":"Before 12:30 PM for lunch.","ageGroup":"All ages. Alcohol service is subject to age restrictions.","minPeople":"1 for normal dining"}'::jsonb,
  '{"summary":"Fish choices and prices depend on the day’s catch.","booking":["Seating is open-sided and can feel warm at lunch.","Arrive before 12:30 PM for a better chance of beating the queue."],"cancellation":[]}'::jsonb,
  '{"priceNarrative":"Approx. ₹390–₹500 for selected fish thalis.","priceUnit":"Per thali; the fish and daily menu affect the price.","meetingPoint":"Vinayak Family Restaurant, House No 278, Socol Vaddo, Assagao, North Goa 403507","phones":["+91 90493 80518"],"included":["Seating and table service. Food and drinks charged separately."],"notIncluded":["Food, drinks, taxes and any booking extras"],"faqs":[{"q":"What should I try?","a":"A fish thali or prawns rawa fry."},{"q":"Closed day?","a":"Thursday."},{"q":"Best arrival time?","a":"Before 12:30 PM for lunch."}],"mapsLabel":"Map"}'::jsonb,
  now()
),
(
  '22222222-2222-4222-8222-222222222303',
  'kokni-kanteen',
  'Kokni Kanteen',
  'published',
  '11111111-1111-4111-8111-111111111203',
  'Old Panaji has been coming here for fish curry since 1972.',
  'Since 1972, Kokni Kanteen has been serving the flavours people associate with home in Goa. Step into its old Panaji setting for a fish thali, local curries and seafood sides. Come early for lunch, before the queue starts building.',
  90,
  8,
  'Come solo, as a couple, with friends or with family.',
  'Kokni Kanteen',
  'Panaji',
  15.4909,
  73.8278,
  1300,
  false,
  'paid to the venue',
  '{"days":"Daily","timeSlot":"Lunch and dinner.","bestTime":"Early lunch, around 12:30 PM.","ageGroup":"All ages. Alcohol service is subject to age restrictions.","minPeople":"1 for normal dining"}'::jsonb,
  '{"summary":"Your booking platform’s terms apply.","booking":["You’ll find it near Mahalaxmi Temple.","Lunch gets busy, so arrive early."],"cancellation":[]}'::jsonb,
  '{"priceNarrative":"Approx. ₹1,300","priceUnit":"For two.","meetingPoint":"Kokni Kanteen, Dr Dada Vaidya Road, near Mahalaxmi Temple, Panaji 403001","phones":["+91 95792 75664"],"included":["Seating and table service. Food and drinks charged separately."],"notIncluded":["Food, drinks, taxes and any booking extras"],"faqs":[{"q":"What should I try?","a":"Fish thali, prawn-stuffed papad and serradura."},{"q":"Where is it?","a":"Near Mahalaxmi Temple in Panaji."},{"q":"When should I go?","a":"Early for lunch."}],"instagramLabel":"Instagram","bookLabel":"Book","mapsLabel":"Map"}'::jsonb,
  now()
),
(
  '22222222-2222-4222-8222-222222222304',
  'ritz-classic-panjim',
  'Ritz Classic Panjim',
  'published',
  '11111111-1111-4111-8111-111111111204',
  'The fish-thali lunch Panaji keeps coming back to.',
  'Some lunches become a habit. At Ritz Classic, that habit is a Goan fish thali filled with curries, seafood sides and familiar flavours. Head to the 18th June Road branch in Panaji for a meal that has kept generations of diners returning.',
  90,
  8,
  'Come solo, as a couple, with friends or with family.',
  'Ritz Classic Panjim',
  'Panaji',
  15.4989,
  73.8272,
  362,
  false,
  'paid to the venue',
  '{"days":"Daily","timeSlot":"11 AM–8:30 PM","bestTime":"Come for lunch, before the busiest period.","ageGroup":"All ages. Alcohol service is subject to age restrictions.","minPeople":"1 for normal dining"}'::jsonb,
  '{"summary":"Venue menu and seating terms apply.","booking":["This listing is for the 18th June Road branch, not Patto or Gymkhana."],"cancellation":[]}'::jsonb,
  '{"priceNarrative":"₹362 for a fish thali.","priceUnit":"Per thali.","meetingPoint":"Ritz Classic Panjim, First Floor, Wagle Vision Building, 18th June Road, Panaji 403001","phones":["+91 832 242 6417"],"included":["Seating and table service. Food and drinks charged separately."],"notIncluded":["Food, drinks, taxes and any booking extras"],"faqs":[{"q":"Which branch?","a":"18th June Road, Panaji."},{"q":"What should I order?","a":"The fish thali."}],"mapsLabel":"Map"}'::jsonb,
  now()
);

insert into experience_tags (experience_id, tag) values
  ('22222222-2222-4222-8222-222222222301', 'Goan Fish Thali'),
  ('22222222-2222-4222-8222-222222222301', 'Homestyle'),
  ('22222222-2222-4222-8222-222222222301', 'Seafood'),
  ('22222222-2222-4222-8222-222222222301', 'Local Favourite'),
  ('22222222-2222-4222-8222-222222222302', 'Goan Fish Thali'),
  ('22222222-2222-4222-8222-222222222302', 'Family Run'),
  ('22222222-2222-4222-8222-222222222302', 'Seafood'),
  ('22222222-2222-4222-8222-222222222302', 'Value'),
  ('22222222-2222-4222-8222-222222222303', 'Konkani'),
  ('22222222-2222-4222-8222-222222222303', 'Heritage'),
  ('22222222-2222-4222-8222-222222222303', 'Fish Thali'),
  ('22222222-2222-4222-8222-222222222303', 'Traditional'),
  ('22222222-2222-4222-8222-222222222303', 'Panaji'),
  ('22222222-2222-4222-8222-222222222304', 'Goan Fish Thali'),
  ('22222222-2222-4222-8222-222222222304', 'Heritage'),
  ('22222222-2222-4222-8222-222222222304', 'Seafood'),
  ('22222222-2222-4222-8222-222222222304', 'Panaji Classic');

insert into experience_inclusions (experience_id, included, title, detail, sort_order) values
  ('22222222-2222-4222-8222-222222222301', true, 'Seating and table service', 'Food and drinks charged separately.', 0),
  ('22222222-2222-4222-8222-222222222301', false, 'Not included: food, drinks, taxes', 'Any booking extras are extra too.', 1),
  ('22222222-2222-4222-8222-222222222302', true, 'Seating and table service', 'Food and drinks charged separately.', 0),
  ('22222222-2222-4222-8222-222222222302', false, 'Not included: food, drinks, taxes', 'Any booking extras are extra too.', 1),
  ('22222222-2222-4222-8222-222222222303', true, 'Seating and table service', 'Food and drinks charged separately.', 0),
  ('22222222-2222-4222-8222-222222222303', false, 'Not included: food, drinks, taxes', 'Any booking extras are extra too.', 1),
  ('22222222-2222-4222-8222-222222222304', true, 'Seating and table service', 'Food and drinks charged separately.', 0),
  ('22222222-2222-4222-8222-222222222304', false, 'Not included: food, drinks, taxes', 'Any booking extras are extra too.', 1);

