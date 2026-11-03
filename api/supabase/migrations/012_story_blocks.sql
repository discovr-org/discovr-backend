-- Story blocks, gallery photos and menus carried over from the original discovr site.
-- Photos and menus are only added where a listing has none.
begin;

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Go With The Flow  At Surf Wala"}, {"type": "line"}, {"type": "quote", "text": "Catch a wave, find your balance, and discover the thrill of surfing along Goa’s beautiful coastline.", "plain": true}, {"type": "line"}, {"type": "text", "paragraphs": [{"text": "About", "strong": true}, {"text": "The water sport where you ride waves on a board, using balance & technique to catch & stay on the swell."}]}, {"type": "photo", "src": "https://media.discovr.in/images/01a17257-ff4d-79ba-bf41-d9718c4323a9.png", "alt": "surf"}, {"type": "text", "paragraphs": [{"text": "Age", "strong": true}, {"text": "5+"}, {"text": "Fitness Levels", "strong": true}, {"text": "Easy - Moderate"}, {"text": "Student Instructor Ratio", "strong": true}, {"text": "1:4"}]}, {"type": "forNotFor", "columns": [{"title": "What''s Included", "tone": "included", "items": ["Surf Board", "Surf Leash", "Instructor", "Wet Suits"]}, {"title": "What''s Not Included", "tone": "bring", "items": ["Towels", "Refresemnets & Hydration"]}]}, {"type": "line"}, {"type": "heading", "level": "small", "text": "The Process"}, {"type": "steps", "items": [{"marker": "1.", "title": "Find it on Discovr", "caption": "Pick surfing from the curated list"}, {"marker": "2.", "title": "Call & Book Your Slot", "caption": "You can call via the number directly, after going through their Website"}, {"marker": "3.", "title": "Show Up & Surf", "caption": "Arriva at your slot time. After a short briefing, you venture into the waters"}]}, {"type": "callout", "tone": "heads_up", "title": "Health Advisory", "paragraphs": ["Guests with a heart condition, asthma, epilepsy, back, neck, shoulder or joint problems, or any other medical condition should check with a doctor & inform the host before booking. Surfing is not recommended during pregnancy."]}, {"type": "line"}, {"type": "checklist", "title": "Things to Get With You", "items": ["Towels", "Extra Pair Of Clothes", "Swimsuits", "Sunscreen", "Toiletries for Showering", "Extra Water Bottles for Hydration"]}, {"type": "callout", "tone": "tip", "title": "Know Before You Go", "paragraphs": ["Arrive 15 mins before your slot, as this is group session", "If you are afraid of waters, kindly notify the team", "The 90 mins are split between briefing & venturing into the sea."]}, {"type": "line"}, {"type": "heading", "level": "small", "text": "FAQ''s"}, {"type": "faq", "items": [{"q": "Do I need to know how to swim?", "a": "No, but being comfortable in the water is recommended, because you’ll fall off the board, & often. \nIf you are uncomfortable in waters, then notify the team"}, {"q": "Who’s with me in the water?", "a": "An instructor stays in the water with you, with the ratio being 1 instructor for every 4 people"}, {"q": "Will I stand up on the first day?", "a": "Possibly. Many beginners stand up for a few seconds, but a proper ride takes several sessions. Anyone who promises you’ll ride on day one is overselling."}, {"q": "Are there Showering Facilities?", "a": "Yes, there are showering facilities available on site"}]}]'::jsonb) where slug = 'surf-wala';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a17247-72ae-7f76-8262-b13b6ff77e02.png', 'Get Into The Waves At Surf Wala', 0, true),
  ('https://media.discovr.in/images/01a17247-ef57-70c0-9c40-243753ff4438.png', 'Get Into The Waves At Surf Wala', 1, false),
  ('https://media.discovr.in/images/01a17247-9149-797c-9da1-b3eac8998634.png', 'Get Into The Waves At Surf Wala', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'surf-wala' and not exists (select 1 from experience_photos p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Bastian Riviera"}, {"type": "line"}, {"type": "quote", "text": "Is part of Bastian Hospitality Group, co-owned by Bollywood Shilpa Shetty. Riviera marks the group’s move into destination-style experiences, bringing together upscale dining, striking architecture, landscaped spaces, & a lively social scene along the Morjim backwaters.", "plain": true}, {"type": "photo", "src": "https://media.discovr.in/images/01a17188-e40c-70a5-8cae-c39c20ebc2ee.png", "alt": "bastian"}, {"type": "text", "paragraphs": [{"text": "Price:", "strong": true}, {"text": "4000 for two people (approx)"}]}]'::jsonb) where slug = 'bastian-riviera';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a1717e-3a7b-739c-89b0-b2e885b05a4d.webp', 'Bastian Riviera', 0, true),
  ('https://media.discovr.in/images/01a17180-07b8-7998-917a-3c2347c9b38d.webp', 'Bastian Riviera', 1, false),
  ('https://media.discovr.in/images/01a17182-5cf5-7541-915d-b45983ae09c7.png', 'Bastian Riviera', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'bastian-riviera' and not exists (select 1 from experience_photos p where p.experience_id = e.id);
insert into experience_menu_pages (experience_id, src, label, alt, sort_order)
select e.id, v.src, v.label, e.title || ' menu, page ' || (v.sort_order + 1), v.sort_order from experiences e,
(values
  ('https://media.discovr.in/images/01a17184-6379-76b7-9cef-b41e92e70576.avif', 'Page 1', 0),
  ('https://media.discovr.in/images/01a17184-7db3-712b-938f-cb32334ee4fe.avif', 'Page 2', 1),
  ('https://media.discovr.in/images/01a17184-8e02-781e-9786-54511a0ff771.avif', 'Page 3', 2),
  ('https://media.discovr.in/images/01a17184-9e34-7336-b80d-c755d082dc3d.avif', 'Page 4', 3),
  ('https://media.discovr.in/images/01a17184-ae32-7154-9b36-cd0e1ef95cd5.avif', 'Page 5', 4),
  ('https://media.discovr.in/images/01a17184-be5b-7f3a-995f-ee06b9efc1ec.avif', 'Page 6', 5),
  ('https://media.discovr.in/images/01a17184-d59d-7e77-a8b0-1393b7f61457.avif', 'Page 7', 6),
  ('https://media.discovr.in/images/01a17184-e858-7d88-bca8-1749149dbe68.avif', 'Page 8', 7),
  ('https://media.discovr.in/images/01a17184-fb78-74b3-b9b9-21b4c907f3d8.avif', 'Page 9', 8),
  ('https://media.discovr.in/images/01a17185-0d53-74f2-9e12-6eb8696c2564.avif', 'Page 10', 9),
  ('https://media.discovr.in/images/01a17185-208f-704e-8ac6-a7bf45e948ab.avif', 'Page 11', 10),
  ('https://media.discovr.in/images/01a17185-3b1c-761b-b8e6-d5422e9938b3.avif', 'Page 12', 11),
  ('https://media.discovr.in/images/01a17185-4d50-7410-a68c-0f1d2d3c175e.avif', 'Page 13', 12),
  ('https://media.discovr.in/images/01a17185-5d64-79d3-ae1e-3e73e01d3388.avif', 'Page 14', 13),
  ('https://media.discovr.in/images/01a17185-6c94-7f9a-988f-3bf2e47b937e.avif', 'Page 15', 14),
  ('https://media.discovr.in/images/01a17185-7ae3-756f-8965-500ff7e0ae0f.avif', 'Page 16', 15)
) as v(src, label, sort_order)
where e.slug = 'bastian-riviera' and not exists (select 1 from experience_menu_pages p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Drop Dead Sexy"}, {"type": "line"}, {"type": "quote", "text": "Created by Goan artist Siddharth Kerkar & co-founder Vipin Raman, the space features moody red lighting, sculptural installations, & mechanical eyes that follow your movement. The cocktail menu takes a seasonal approach, reimagining a single ingredient through unexpected flavors & techniques, while Burmese-inspired bar bites round out the experience.", "plain": true}, {"type": "photo", "src": "https://media.discovr.in/images/01a171a7-1e8d-79f7-a110-0a3e0840c942.jpg", "alt": "DDS"}, {"type": "text", "paragraphs": [{"text": "Price:", "strong": true}, {"text": "2800 for two (approx)"}]}]'::jsonb) where slug = 'drop-dead-sexy';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a1719f-1c5e-7490-aee7-105ced3205d0.png', 'Drop Dead Sexy', 0, true),
  ('https://media.discovr.in/images/01a1719f-3526-7241-9ca6-014bd3159a80.webp', 'Drop Dead Sexy', 1, false),
  ('https://media.discovr.in/images/01a171a1-c448-7bfc-9c6b-a59a29d0e1ef.png', 'Drop Dead Sexy', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'drop-dead-sexy' and not exists (select 1 from experience_photos p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Paddle Into The Wild"}, {"type": "line"}, {"type": "quote", "text": "Swap the beach for a peaceful paddle through winding green tunnels.", "plain": true}, {"type": "line"}, {"type": "text", "paragraphs": [{"text": "About", "strong": true}, {"text": "A way to explore Goa’s quieter side, paddling through winding waterways, lush mangroves, & scenic backwaters."}]}, {"type": "photo", "src": "https://media.discovr.in/images/01a17217-ec28-7313-8554-ed15055f2ce7.png", "alt": "kayaking"}, {"type": "text", "paragraphs": [{"text": "Age:", "strong": true}, {"text": "5+ years"}, {"text": "Fitness Levels:", "strong": true}, {"text": "Easy"}, {"text": "No Of People:", "strong": true}, {"text": "1-15 People"}]}, {"type": "forNotFor", "columns": [{"title": "What''s Included", "tone": "included", "items": ["Kayaks", "Life Jackets", "Local Guides", "Photos & Videos"]}, {"title": "What''s Not Included", "tone": "bring", "items": ["Meals & Refreshments", "Showering Facilities"]}]}, {"type": "line"}, {"type": "heading", "level": "small", "text": "The Process"}, {"type": "steps", "items": [{"marker": "1.", "title": "Find it on Discovr", "caption": "Pick mangrove kayaking from the curated list"}, {"marker": "2.", "title": "Call to Book", "caption": "Call the host directly & book you slot."}, {"marker": "3.", "title": "Show up  & paddle", "caption": "Meet at the Mangroves & paddle into the backwaters"}]}, {"type": "callout", "tone": "heads_up", "title": "Health Advisory", "paragraphs": ["Guests with a heart condition, asthma or any other medical condition must inform the host before booking."]}, {"type": "line"}, {"type": "checklist", "title": "Things To Bring Take With You", "items": ["Extra Clothes", "Towels", "Dry Bags For Valuables", "Sunglasses & Caps", "Sunscreen", "Extra Water Bottles & Refreshments"]}, {"type": "callout", "tone": "tip", "title": "Know Before You Go", "paragraphs": ["After a short briefing from the instructor, you take the kayak out yourself.", "The instructor does not paddle with you, but assistance will be provided.", "Bring a change of clothes, you might get wet."]}, {"type": "line"}, {"type": "heading", "level": "small", "text": "FAQ''s"}, {"type": "faq", "items": [{"q": "Will I be paddling alone?", "a": "You paddle without an instructor in the kayak, after a short briefing. \n\nSingle kayaks are for one person, or double kayaks seat two, so you can go with a friend or partner."}, {"q": "Will I get Wet?", "a": "Yes, a bit. Water splashes in as you paddle, so expect damp clothes.\n\n Bring a change of clothes and keep your phone & valuables in a dry bag."}, {"q": "Do I Need To Know Swimming?", "a": "No, life jackets will be provided for your safety."}, {"q": "Are There Showering Facilities?", "a": "No, There are no showering facilities available. You could change in a nearby bar or restaurant"}]}]'::jsonb) where slug = 'baga-mangrove-kayaking';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a17213-d07f-75f9-8a6b-20910014150c.png', 'Into the Wild Mangroves At Baga Kayaking', 0, true),
  ('https://media.discovr.in/images/01a16ec9-d737-7f26-b55e-0fd5c70fa125.png', 'Into the Wild Mangroves At Baga Kayaking', 1, false),
  ('https://media.discovr.in/images/01a16eca-128f-7ddd-9770-fc433657d557.png', 'Into the Wild Mangroves At Baga Kayaking', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'baga-mangrove-kayaking' and not exists (select 1 from experience_photos p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Clay, Shaped by Hand  at Mati Earth"}, {"type": "line"}, {"type": "quote", "text": "Shape, pinch, & create with clay, your take home piece", "plain": true}, {"type": "line"}, {"type": "text", "paragraphs": [{"text": "About", "strong": true}, {"text": "Discover the art of hand-building with clay, using ancient techniques & simple tools. Slow down, work with your hands, & shape something of your own."}]}, {"type": "photo", "src": "https://media.discovr.in/images/01a16fd2-2d91-770c-993f-31a4a4e3efe1.png", "alt": "Hand Building"}, {"type": "text", "paragraphs": [{"text": "Age:", "strong": true}, {"text": "9+"}, {"text": "No Of People:", "strong": true}, {"text": "1-10"}]}, {"type": "forNotFor", "columns": [{"title": "What''s Included", "tone": "included", "items": ["Clay", "Tools", "Guidance"]}, {"title": "What''s Not Included", "tone": "bring", "items": ["Firing of the piece", "Potter''s Wheel"]}]}, {"type": "line"}, {"type": "heading", "level": "small", "text": "The Process"}, {"type": "steps", "items": [{"marker": "1.", "title": "Find it on discovr", "caption": "Pick the hand building workshop at Mati Earth from the curated list"}, {"marker": "2.", "title": "Book Via The Website", "caption": "Choose the course & make the payment Online"}, {"marker": "3.", "title": "Show Up & Make Your Piece", "caption": "Show up at the studio & hand build your piece"}]}, {"type": "callout", "tone": "heads_up", "title": "Instructions To Follow", "paragraphs": ["Please arrive on time, since this is a group session, the teacher cannot re-start instructions if someone joins late.", "No professional photo/videoshoots are allowed during the workshop."]}, {"type": "text", "paragraphs": [{"text": "Note : Wear comfortable clothes you don’t mind getting a little clay on. Preferably no whites & lights."}]}, {"type": "line"}, {"type": "heading", "level": "small", "text": "FAQ''S"}, {"type": "faq", "items": [{"q": "What is Hand Building?", "a": "It is a set of ancient techniques for shaping clay using just your hands and simple tools, without the need of a potter’s wheel. A satisfying, hands-on process that lets you slow down, focus, & enjoy the tactile joy of creating something with your own hands."}, {"q": "What will I make in this session?", "a": "We’ll start with a warm-up exercise to get familiar with the clay. Then, you’ll create a small pinch pot & move on to decorating or sculpting a unique crafted piece."}, {"q": "Do I get to keep what I make?", "a": "Absolutely! You can choose to have your clay piece fired & sent to you at a later stage. We will bisque fire your piece & carefully ship it to you once it’s ready."}, {"q": "Are there any extra costs to take my piece home?", "a": "Yes, Firing Charges of ₹300 + shipping charges are applicable. Firing helps the piece become durable"}]}]'::jsonb) where slug = 'mati-earth-studio';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a16fcb-fdbf-79e8-903b-fab7f1026d87.png', 'Mould Your On Piece At Mati Earth Studio', 0, true),
  ('https://media.discovr.in/images/01a16fcc-2a5c-7243-976c-ae8ec03a1819.png', 'Mould Your On Piece At Mati Earth Studio', 1, false),
  ('https://media.discovr.in/images/01a16fcc-6439-7591-ad61-a9c44d623ff0.png', 'Mould Your On Piece At Mati Earth Studio', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'mati-earth-studio' and not exists (select 1 from experience_photos p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "MTW Bar & Toasties"}, {"type": "line"}, {"type": "quote", "text": "MTW Bar & Toasties is known for seriously good toasted sandwiches & cocktails. With dim lighting, an intimate setting, & a menu built for after-work drinks and late-night cravings, it’s a great spot for inventive cocktails & comfort bites without the fuss.", "plain": true}, {"type": "photo", "src": "https://media.discovr.in/images/01a170e1-b673-7fc9-8311-92ee37a45920.png", "alt": "mtw"}, {"type": "text", "paragraphs": [{"text": "Prices:", "strong": true}, {"text": "1600 for two (approx)"}]}]'::jsonb) where slug = 'mtw-bar-and-toasties';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a16ec4-86ea-78b9-b93b-365d6f12f825.png', 'MTW Bar & Toasties', 0, true),
  ('https://media.discovr.in/images/01a16ec5-5d2d-7758-9ad8-031edd0ed1a3.png', 'MTW Bar & Toasties', 1, false),
  ('https://media.discovr.in/images/01a16ec5-7863-7230-9b91-0cc9fe8b076f.png', 'MTW Bar & Toasties', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'mtw-bar-and-toasties' and not exists (select 1 from experience_photos p where p.experience_id = e.id);
insert into experience_menu_pages (experience_id, src, label, alt, sort_order)
select e.id, v.src, v.label, e.title || ' menu, page ' || (v.sort_order + 1), v.sort_order from experiences e,
(values
  ('https://media.discovr.in/images/01a16ec4-9df5-7c32-a2b1-15e46fd94a95.avif', 'Drinks', 0)
) as v(src, label, sort_order)
where e.slug = 'mtw-bar-and-toasties' and not exists (select 1 from experience_menu_pages p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Kayaking Among the Palms"}, {"type": "line"}, {"type": "quote", "text": "Slip into calm water lined with palms & paddle slowly through it, with the light coming down through the fronds.", "plain": true}, {"type": "line"}, {"type": "text", "paragraphs": [{"text": "About", "strong": true}, {"text": "Slip into calm water, lined with palms & paddle slowly through it. After a short briefing, you take the kayak out on your own, setting the pace & the direction, of where the water leads you."}]}, {"type": "photo", "src": "https://media.discovr.in/images/01a16e38-b0d7-7275-8f5a-0ec343c9db9c.png", "alt": "Open Sea Kayaking"}, {"type": "text", "paragraphs": [{"text": "Age:", "strong": true}, {"text": "10+"}, {"text": "Fitness Levels:", "strong": true}, {"text": "Easy"}, {"text": "No Of People:", "strong": true}, {"text": "1-15 people"}]}, {"type": "forNotFor", "columns": [{"title": "What''s Included", "tone": "included", "items": ["Kayaks", "Life Jackets", "Local Guide", "Photos & Videos"]}, {"title": "What''s Not Included", "tone": "bring", "items": ["Meals & Refreshments", "Showering Facilities"]}]}, {"type": "line"}, {"type": "heading", "level": "small", "text": "The Process"}, {"type": "steps", "items": [{"marker": "1", "title": "Find it on Discovr", "caption": "Pick the kayaking trip from the curated list."}, {"marker": "2", "title": "Call to book", "caption": "Call the host directly & book you slot."}, {"marker": "3", "title": "Show up & paddle", "caption": "Meet at the beach & paddle into the open sea"}]}, {"type": "callout", "tone": "heads_up", "title": "Health Advisory", "paragraphs": ["Guests with a heart condition, asthma or any other medical condition must inform the host before booking."]}, {"type": "line"}, {"type": "checklist", "title": "Things To Take With You", "items": ["Extra Clothes", "Towels", "Dry Bag for Valuables", "Sunglasses & Caps", "Sunscreen", "Extra Water Bottles & Refreshments"]}, {"type": "callout", "tone": "tip", "title": "Know Before You Go", "paragraphs": ["After a short briefing from the instructor, you take the kayak out yourself.", "The instructor does not paddle with you, but assistance will be provided.", "Bring a change of clothes, you might get wet."]}, {"type": "line"}, {"type": "heading", "level": "section", "text": "FAQ''s"}, {"type": "faq", "items": [{"q": "Will I be paddling alone?", "a": "You paddle without an instructor in the kayak, after a short briefing. \n\nSingle kayaks are for one person, or double kayaks seat two, so you can go with a friend or partner."}, {"q": "Will I get Wet", "a": "Yes, a bit. Water splashes in as you paddle, so expect damp clothes.\n\n Bring a change of clothes and keep your phone & valuables in a dry bag or leave them at the beach."}, {"q": "Do I Need To Know Swimming?", "a": "No, life jackets will be provided for your safety."}, {"q": "Are There Showering Facilities?", "a": "No, There are no showering facilities available on the Beach. \n\nThere is a bar & restaurant close to the beach, where guests may change into dry clothes once they are done."}]}]'::jsonb) where slug = 'palolem-beach-kayaking';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a16e1e-08ad-7768-9c56-8e28313b1563.png', 'Between the Open Waters', 0, true),
  ('https://media.discovr.in/images/01a16e1d-954b-79e8-8e9f-818206b1b578.png', 'Group of 6 Kayaking', 1, false),
  ('https://media.discovr.in/images/01a16e1d-bc46-714f-af0f-487bf6deb815.png', 'Doubles Paddling', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'palolem-beach-kayaking' and not exists (select 1 from experience_photos p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Padel for 4 at Coco"}, {"type": "line"}, {"type": "quote", "text": "Padel is tennis on a smaller court, with walls in play. Two against two, & the point only ends when the ball does.", "plain": true}, {"type": "line"}, {"type": "text", "paragraphs": [{"text": "About", "strong": true}, {"text": "Serve underarm, rally in pairs, & play the ball off the walls, with the same scoring as tennis."}]}, {"type": "photo", "src": "https://media.discovr.in/images/01a16f2a-6cae-70a2-a163-08ca87b3731b.png", "alt": "Coco Padel, Goa"}, {"type": "text", "paragraphs": [{"text": "Age:", "strong": true}, {"text": "All Ages"}, {"text": "Fitness:", "strong": true}, {"text": "Easy"}, {"text": "No Of Players:", "strong": true}, {"text": "2-4 people"}]}, {"type": "forNotFor", "columns": [{"title": "What''s Included", "tone": "included", "items": ["Drinking Water", "Warm Up Area", "Showers", "Washrooms", "Wifi", "Parking"]}, {"title": "What''s Not Included", "tone": "bring", "items": ["Racquets", "Balls", "Shoes", "Towels"]}]}, {"type": "line"}, {"type": "heading", "level": "small", "text": "The Process"}, {"type": "steps", "items": [{"marker": "1.", "title": "Find it on discovr", "caption": "Pick padel at Coco from the curated list"}, {"marker": "2.", "title": "Book & pay on Hudle", "caption": "Choose your slot on the Hudle app & pay in advance."}, {"marker": "3.", "title": "Show up & play", "caption": "Arrive at Coco in Assagao at your slot time & start your game."}]}, {"type": "callout", "tone": "heads_up", "title": "Health Advisory", "paragraphs": ["Guests with a heart condition, asthma, joint or back problems, or any other medical condition should consult a doctor before playing & inform the host before booking."]}, {"type": "line"}, {"type": "checklist", "title": "Things To Take With You", "items": ["Racquets (Available on Rent On Site)", "Balls (Available to Buy on Site)", "Non Marking Shoes", "Hand Towels", "Extra Water Bottles", "Refreshments"]}, {"type": "callout", "tone": "tip", "title": "Know Before You Go", "paragraphs": ["Bring your own racquets & balls. Racquets can be rented for ₹50 each, on site. Balls can’t be rented, so you’ll need to buy them at the venue."]}, {"type": "line"}, {"type": "heading", "level": "small", "text": "FAQ''s"}, {"type": "faq", "items": [{"q": "What If I am A Single Player?", "a": "Call Coco before booking & ask to be paired with other players. Padel is played in doubles, so they will try to match you with a group."}, {"q": "Can I play if I am a Beginner?", "a": "Yes, Padel is a beginner friendly game"}, {"q": "Are There Changing Facilities?", "a": "Yes, there are Washrooms & Showering Areas available."}, {"q": "What are the Additional Facilities?", "a": "Bell Boy \nCafe \nFlood Lights \nSeating Area \nRental Equipment''s\nSound System \nCoaching Available"}]}]'::jsonb) where slug = 'coco-padel';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a16e83-9920-73a8-856f-649d0cef130d.png', 'Padel Doubles at Coco', 0, true),
  ('https://media.discovr.in/images/01a16e84-0192-7490-b9df-8422667c81ea.png', 'Padel Doubles at Coco', 1, false),
  ('https://media.discovr.in/images/01a16f1d-52cc-758b-82c5-2ed3e21ff904.png', 'Padel Doubles at Coco', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'coco-padel' and not exists (select 1 from experience_photos p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Pisco By The Beach"}, {"type": "line"}, {"type": "quote", "text": "Brings together beachfront dining, global flavours, & handcrafted cocktails in a relaxed, tropical setting. Surrounded by lush greenery, natural textures, & warm wooden interiors, the space feels equally suited to a leisurely lunch, a long sunset session, or an unhurried dinner.", "plain": true}, {"type": "photo", "src": "https://media.discovr.in/images/01a17174-c695-7afb-847b-22c0a9eb8071.png", "alt": "pisco"}, {"type": "text", "paragraphs": [{"text": "Prices:", "strong": true}, {"text": "1800 for two (approx)"}]}]'::jsonb) where slug = 'pisco-by-the-beach';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a1716c-f681-7928-b2de-2ef399732d92.png', 'Pisco By The Beach', 0, true),
  ('https://media.discovr.in/images/01a1716c-de09-7326-9f05-5ff89b0ef037.png', 'Pisco By The Beach', 1, false),
  ('https://media.discovr.in/images/01a17170-1290-714e-bebf-cdf3db1e31ec.png', 'Pisco By The Beach', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'pisco-by-the-beach' and not exists (select 1 from experience_photos p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Get Inked Where Rebel Kid Did!"}, {"type": "line"}, {"type": "quote", "text": "Pick a design, sit down with the artist & take home a souvenir that stays.", "plain": true}, {"type": "line"}, {"type": "text", "paragraphs": [{"text": "About", "strong": true}, {"text": "A symbolical design drawn on your skin with a needle & ink, & the artist you pick decides how it looks & how it ages."}]}, {"type": "photo", "src": "https://media.discovr.in/images/01a17011-5f27-797e-9795-ffa89953d422.png", "alt": "Close up tattoo"}, {"type": "text", "paragraphs": [{"text": "Age", "strong": true}, {"text": "18+"}]}, {"type": "forNotFor", "columns": [{"title": "What''s Included", "tone": "included", "items": ["Your Design", "Post Tattoo Care Gel"]}, {"title": "What''s Not Included", "tone": "bring", "items": ["Warranty Card", "Extra Ointments"]}]}, {"type": "callout", "tone": "tip", "title": "Note", "paragraphs": ["The Price of the Tattoo depends on the detailing of the Design.                      The average is 2,000 + taxes for 3 inches, but is subject to change"]}, {"type": "line"}, {"type": "heading", "level": "small", "text": "The Process"}, {"type": "steps", "items": [{"marker": "1.", "title": "Find it on Discovr", "caption": "Pick the tattoo studio from the curated list"}, {"marker": "2.", "title": "Call To Book", "caption": "Call the studio, share your design idea & fix a date and time."}, {"marker": "3.", "title": "Show Up & Get Inked", "caption": "Arrive at the studio at your slot time, finalize the design with your artist & get Inked."}]}, {"type": "callout", "tone": "heads_up", "title": "Health Advisory", "paragraphs": ["Guests with diabetes, skin condition & allergies should consult a doctor before getting a tattoo & inform the host before booking."]}, {"type": "checklist", "title": "What To Come With", "items": ["Your Design Idea", "Preferred Area On Body", "Comfortable Clothing"]}, {"type": "line"}, {"type": "heading", "level": "small", "text": "FAQ''s"}, {"type": "faq", "items": [{"q": "What is the Average Price?", "a": "The price varies depending on the Detail. The Tattoo Studio charges around 2,000 + taxes for a 3 inch tattoo. Talk to your tattoo artist to confirm the price"}, {"q": "Does it hurt?", "a": "Yes, a bit. How much depends on where you get it. You feel like something is pricking in, but eventually settle in."}, {"q": "Can I get a tattoo without having a design in mind?", "a": "The artist can suggest designs, but only get one you’re sure about and that means something to you."}, {"q": "What should I do before I go?", "a": "Eat a proper meal, drink water & sleep well. Don’t drink alcohol for 24 hours before, since it thins the blood & can make the session harder. Wear clothes that let the artist reach the area."}, {"q": "How do I look after it?", "a": "Keep it clean & dry, & use only the aftercare the artist gives you. Stay out of the sea, pool & direct sun while it heals."}]}]'::jsonb) where slug = 'angel-tattoo';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a17008-1105-702f-a911-728ae80dabca.png', 'Ink From Your Goa Trip at Angel Tattoo', 0, true),
  ('https://media.discovr.in/images/01a17008-4a1a-7e0c-b5e3-665f89a0acb5.png', 'Ink From Your Goa Trip at Angel Tattoo', 1, false),
  ('https://media.discovr.in/images/01a17008-694b-77da-8920-14b1a9fbc4ff.png', 'Ink From Your Goa Trip at Angel Tattoo', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'angel-tattoo' and not exists (select 1 from experience_photos p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "The Loft"}, {"type": "line"}, {"type": "quote", "text": "An intimate underground music venue where immersive sound, experimental electronic music, & atmospheric lighting come together, hosting curated DJ sets that move between techno, electro, & house in a space built for late-night dancing and music-led experiences.", "plain": true}, {"type": "photo", "src": "https://media.discovr.in/images/01a17160-7e46-7e5f-83f4-67ab81e1b18a.png", "alt": "the loft"}, {"type": "text", "paragraphs": [{"text": "Prices:", "strong": true}, {"text": "1800 for two (approx)"}, {"text": "Music", "strong": true}, {"text": "EDM, Techno"}]}]'::jsonb) where slug = 'the-loft-at-anamiva';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a1715a-9b1e-7bbf-abef-a80ecc20efc0.png', 'The Loft', 0, true),
  ('https://media.discovr.in/images/01a17158-410d-70c3-a5f9-fa1199c6b30b.png', 'The Loft', 1, false),
  ('https://media.discovr.in/images/01a1715a-352e-7114-b1a0-374ceea13d4f.png', 'The Loft', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'the-loft-at-anamiva' and not exists (select 1 from experience_photos p where p.experience_id = e.id);
insert into experience_menu_pages (experience_id, src, label, alt, sort_order)
select e.id, v.src, v.label, e.title || ' menu, page ' || (v.sort_order + 1), v.sort_order from experiences e,
(values
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715c-7542-78e3-8921-df95097f28fa.webp', 'Page 1', 0),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715c-8d27-7f66-b8aa-0db215dc5a6a.webp', 'Page 2', 1),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715c-ac58-7d71-9d20-3dcd5f859502.webp', 'Page 3', 2),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715c-bca1-7307-b5a6-e241563e7988.webp', 'Page 4', 3),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715c-cc6e-71ea-8205-c2b549b54b52.webp', 'Page 5', 4),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715c-e035-7f1b-87e1-a44608f15049.webp', 'Page 6', 5),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715c-f9a0-7d2b-bd73-c5f1293a7fba.webp', 'Page 7', 6),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715d-0d9c-7c6d-bedf-2282c7ffcce7.webp', 'Page 8', 7),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715d-2018-7aca-bc4c-1aa32970c0cf.webp', 'Page 9', 8),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715d-34d5-7793-9632-8a5659fddd7c.webp', 'Page 10', 9),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715d-4776-7d20-a995-e2629befc9eb.webp', 'Page 11', 10),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715d-5e4b-72c1-9260-84beb2fb7406.webp', 'Page 12', 11),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715d-7acd-7a92-9113-d27fb1fcb945.webp', 'Page 13', 12),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715d-91db-743b-a9e4-a63a2c543092.webp', 'Page 14', 13),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715d-a561-73a3-9846-3580140e1d2d.webp', 'Page 15', 14),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715d-b7bc-7502-bf0d-c6da6795157b.webp', 'Page 16', 15),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715d-d28a-74a5-b762-edb89af9a8b5.webp', 'Page 17', 16),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715d-e745-79dc-b0d0-dff5b7d2e233.webp', 'Page 18', 17),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715d-fe8c-7573-b5da-e6ff37a6ede1.webp', 'Page 19', 18),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a1715e-11ce-7439-9080-a4f568f0c3c3.webp', 'Page 20', 19)
) as v(src, label, sort_order)
where e.slug = 'the-loft-at-anamiva' and not exists (select 1 from experience_menu_pages p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Boiler Maker"}, {"type": "line"}, {"type": "quote", "text": "Siolim’s boilermaker bar: No. 8 in Asia, No. 57 in the world (50 Best Bars 2026), No. 4 in India (30 Best Bars India 2025).", "plain": true}, {"type": "photo", "src": "https://media.discovr.in/images/01a1706a-9407-74bf-bac4-a3e89e374db5.webp", "alt": "Boilermaker"}, {"type": "text", "paragraphs": [{"text": "Charges", "strong": true}, {"text": "2000 per person (approx)"}, {"text": "Music", "strong": true}, {"text": "Plays a lively, boisterous, & high-energy soundtrack curated directly by its bartenders"}]}]'::jsonb) where slug = 'boilermaker';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a17065-d60f-7315-8652-d39421e546e7.webp', 'Boiler Maker', 0, true),
  ('https://media.discovr.in/images/01a17065-f3bd-7eba-ba56-502233e53ee4.png', 'Boiler Maker', 1, false),
  ('https://media.discovr.in/images/01a17066-0fad-7f44-b4e2-a08c39685e83.png', 'Boiler Maker', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'boilermaker' and not exists (select 1 from experience_photos p where p.experience_id = e.id);
insert into experience_menu_pages (experience_id, src, label, alt, sort_order)
select e.id, v.src, v.label, e.title || ' menu, page ' || (v.sort_order + 1), v.sort_order from experiences e,
(values
  ('https://media.discovr.in/images/01a17066-5c94-79c7-96e5-b7f8ef162f50.avif', 'Food Menu 1', 0),
  ('https://media.discovr.in/images/01a17066-9b30-73df-96bf-05da914e5bda.avif', 'Food Menu 2', 1),
  ('https://media.discovr.in/images/01a17066-bf0d-7acc-985a-eb4c9c5458c6.avif', 'Food Menu 3', 2),
  ('https://media.discovr.in/images/01a17066-e491-7f55-9db8-bb2f4e082ae1.avif', 'Dessert', 3),
  ('https://media.discovr.in/images/01a17067-10d6-71bf-96fa-ca3820585b84.avif', 'Chef''s Special', 4),
  ('https://media.discovr.in/images/01a17067-4b75-7b3c-81c0-2f28e19da22f.avif', 'Chef''s Special', 5)
) as v(src, label, sort_order)
where e.slug = 'boilermaker' and not exists (select 1 from experience_menu_pages p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Goan Flavours, Straight from the Coast"}, {"type": "line"}, {"type": "quote", "text": "A go-to spot for authentic Goan seafood, serving comforting fish thalis & local coastal flavours that bring the taste of Goa straight to your plate.", "plain": true}, {"type": "photo", "src": "https://media.discovr.in/images/01a17230-97da-71a9-83f9-19d9e2841e9f.webp", "alt": "bombil"}, {"type": "text", "paragraphs": [{"text": "Price", "strong": true}, {"text": "1000 for two (approx)"}]}]'::jsonb) where slug = 'bombil';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a16ee5-50c3-7955-a33b-221a72bf1a7f.png', 'Bombil Ft. Goan Thali', 0, true),
  ('https://media.discovr.in/images/01a16ee5-6853-764d-8751-08e4b75d9f0a.png', 'Bombil Ft. Goan Thali', 1, false),
  ('https://media.discovr.in/images/01a16ee5-7df9-7903-9dcf-7d9262201082.png', 'Bombil Ft. Goan Thali', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'bombil' and not exists (select 1 from experience_photos p where p.experience_id = e.id);
insert into experience_menu_pages (experience_id, src, label, alt, sort_order)
select e.id, v.src, v.label, e.title || ' menu, page ' || (v.sort_order + 1), v.sort_order from experiences e,
(values
  ('https://media.discovr.in/images/01a1723a-a750-7888-99ac-4cb89c89a772.avif', 'Page 1', 0)
) as v(src, label, sort_order)
where e.slug = 'bombil' and not exists (select 1 from experience_menu_pages p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Cajy Bar"}, {"type": "line"}, {"type": "quote", "text": "Cajy Bar in Arpora is a family-run Goan tavern that dates back to 1970, run by the Fernandes family, The setting is rustic and unpretentious, with crate style seating, fairy lights & retro music.", "plain": true}, {"type": "photo", "src": "https://media.discovr.in/images/01a170ca-36d1-743f-8d82-1a5116b8644e.webp", "alt": "cajy bar"}, {"type": "text", "paragraphs": [{"text": "Prices", "strong": true}, {"text": "1000 for two (approx)"}]}]'::jsonb) where slug = 'cajy-bar';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a170c6-8fbc-7a60-8013-6b075fd2387e.png', 'Cajy Bar', 0, true),
  ('https://media.discovr.in/images/01a170c6-bd54-71f4-8fa6-f6a6c960148e.jpg', 'Cajy Bar', 1, false),
  ('https://media.discovr.in/images/01a170c6-e368-7a61-b28f-f805007b8f5f.webp', 'Cajy Bar', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'cajy-bar' and not exists (select 1 from experience_photos p where p.experience_id = e.id);
insert into experience_menu_pages (experience_id, src, label, alt, sort_order)
select e.id, v.src, v.label, e.title || ' menu, page ' || (v.sort_order + 1), v.sort_order from experiences e,
(values
  ('https://media.discovr.in/images/01a170c7-3985-73a0-a03d-3389543f1960.avif', 'Page 1', 0),
  ('https://media.discovr.in/images/01a170c7-54f6-7e15-9bd1-8a525e1620e6.avif', 'Page 2', 1),
  ('https://media.discovr.in/images/01a170c7-6882-75ee-974d-41d7854dff65.avif', 'Page 3', 2),
  ('https://media.discovr.in/images/01a170c7-7e73-7781-a023-a6e5ae0fcf69.avif', 'Page 4', 3)
) as v(src, label, sort_order)
where e.slug = 'cajy-bar' and not exists (select 1 from experience_menu_pages p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Juna"}, {"type": "line"}, {"type": "quote", "text": "A Goan-Portuguese bungalow in Anjuna, run by the team behind Hideaway & Magnetic Fields, with a cocktail bar in the courtyard & 100-capacity sound room inside.", "plain": true}, {"type": "photo", "src": "https://media.discovr.in/images/01a17053-a747-7f91-9363-95365dc4b6e0.png", "alt": "Courtyard"}, {"type": "text", "paragraphs": [{"text": "Charges", "strong": true}, {"text": "₹1500 for two"}, {"text": "Music", "strong": true}, {"text": "EDM, Techno, Hip Hop, Dubstep, Bass House"}, {"text": "Cover Charges", "strong": true}, {"text": "₹600-800 per person, post 10 pm"}]}, {"type": "line"}]'::jsonb) where slug = 'juna';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a17049-f5df-74de-9518-1f8b5204c9d4.png', 'Juna', 0, true),
  ('https://media.discovr.in/images/01a16eeb-d841-79dc-b707-1a27f734ef46.png', 'Juna', 1, false),
  ('https://media.discovr.in/images/01a1704a-61f6-704a-a675-3210ff989edf.png', 'Juna', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'juna' and not exists (select 1 from experience_photos p where p.experience_id = e.id);
insert into experience_menu_pages (experience_id, src, label, alt, sort_order)
select e.id, v.src, v.label, e.title || ' menu, page ' || (v.sort_order + 1), v.sort_order from experiences e,
(values
  ('https://media.discovr.in/images/01a1704a-a58a-758c-9886-7edc42f3aee8.avif', 'Food Menu 1', 0),
  ('https://media.discovr.in/images/01a1704a-cc81-70d8-be71-d815b062bacb.avif', 'Food Menu 2', 1),
  ('https://media.discovr.in/images/01a1704a-f22c-7cd1-93a9-5fe5cdb56327.avif', 'Food Menu 3', 2),
  ('https://media.discovr.in/images/01a1704b-1917-7b9c-a474-8102f123ab02.avif', 'Food Menu 4', 3),
  ('https://media.discovr.in/images/01a1704c-c074-7845-94b8-8d14b96bb68a.avif', 'Food Menu 5', 4)
) as v(src, label, sort_order)
where e.slug = 'juna' and not exists (select 1 from experience_menu_pages p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Paloma"}, {"type": "line"}, {"type": "quote", "text": "A breezy, tropical spot by the beach, serving wood-fired pizzas & fresh cocktails in an open, leafy setting that’s made for long lunches, sunset drinks, & evenings that stretch a little longer.", "plain": true}, {"type": "photo", "src": "https://media.discovr.in/images/01a170b3-f43f-7df5-ae82-73dd1787c026.png", "alt": "Sunset"}, {"type": "text", "paragraphs": [{"text": "Price", "strong": true}, {"text": "2600 for two (approx)"}]}]'::jsonb) where slug = 'paloma';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a170ac-dac8-7402-8802-f9960ce6f9f1.png', 'Paloma', 0, true),
  ('https://media.discovr.in/images/01a1707f-848a-757c-8959-bb0149e2a8e0.png', 'Paloma', 1, false),
  ('https://media.discovr.in/images/01a17082-6032-7cab-9520-67818745b901.png', 'Paloma', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'paloma' and not exists (select 1 from experience_photos p where p.experience_id = e.id);
insert into experience_menu_pages (experience_id, src, label, alt, sort_order)
select e.id, v.src, v.label, e.title || ' menu, page ' || (v.sort_order + 1), v.sort_order from experiences e,
(values
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a3-dc87-7c72-a070-1761ea540aa6.webp', 'Page 1', 0),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a4-0aae-70f7-bcae-b68a022e6f7a.webp', 'Page 2', 1),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a4-2603-742f-a78f-ccd1a2106cef.webp', 'Page 3', 2),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a4-677d-7a02-a85d-ff6fa9d45e37.webp', 'Page 4', 3),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a4-97b0-7044-b4d9-1e7cfb9782e5.webp', 'Page 5', 4),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a4-aa20-722d-b3ba-ee90c716d140.webp', 'Page 6', 5),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a4-dc5e-7e4c-8c08-7dd761bd9aa5.webp', 'Page 7', 6),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a5-44cb-7af2-b7bd-489912403aa7.webp', 'Page 8', 7),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a5-73cb-728e-b778-2bbf797d93f9.webp', 'Page 9', 8),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a5-9fde-729b-abc9-31abe50daa08.webp', 'Page 10', 9),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a6-3e8d-7436-95b2-50d22c95e704.webp', 'Page 11', 10),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a5-c865-79db-a50e-95c36b59fc60.webp', 'Page 12', 11),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a5-ecb9-7dec-812a-753eb903d08a.webp', 'Page 13', 12),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a6-7cd6-7bc6-90ac-efc39c479a3b.webp', 'Page 14', 13),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a6-b09a-7453-8655-a1ae90db5fba.webp', 'Page 15', 14),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a6-ef2a-7498-9ea5-9be7c1b2d494.webp', 'Page 16', 15),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a7-348a-72bf-a494-4da59aa93579.webp', 'Page 17', 16),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a7-552c-7ed8-b3d8-3d04bc28d1dd.webp', 'Page 18', 17),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170a7-8bdc-752c-adce-ba8849b4aa88.webp', 'Page 19', 18)
) as v(src, label, sort_order)
where e.slug = 'paloma' and not exists (select 1 from experience_menu_pages p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Raeeth"}, {"type": "line"}, {"type": "quote", "text": "Is a Mediterranean-inspired restaurant & nightlife destination where tropical interiors, creative cocktails & late-night DJ sets come together. The atmosphere shifts from laid-back dining to a high-energy party, with melodic house, deep house, progressive house, tech house, & techno setting the tone.", "plain": true}, {"type": "photo", "src": "https://media.discovr.in/images/01a170f5-a169-731f-b7b3-634f7bbc8b18.png", "alt": "raeeth"}, {"type": "text", "paragraphs": [{"text": "Prices", "strong": true}, {"text": "2000 + per person (approx)"}, {"text": "Music", "strong": true}, {"text": "EDM, Tech House, Progressive House, Bass House"}]}]'::jsonb) where slug = 'raeeth';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a170ef-4ffb-78b8-bc32-cbeb822f3a9f.png', 'Raeeth', 0, true),
  ('https://media.discovr.in/images/01a170ef-7626-74eb-8d1b-c48c264e6ada.png', 'Raeeth', 1, false),
  ('https://media.discovr.in/images/01a170f1-8df4-77a2-851e-40fc40faa711.png', 'Raeeth', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'raeeth' and not exists (select 1 from experience_photos p where p.experience_id = e.id);
insert into experience_menu_pages (experience_id, src, label, alt, sort_order)
select e.id, v.src, v.label, e.title || ' menu, page ' || (v.sort_order + 1), v.sort_order from experiences e,
(values
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170f0-b331-7614-8abe-9cdb11a11e68.webp', 'Page 1', 0),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170f0-cc5b-7316-b7dc-66cbb0fcbb69.webp', 'Page 2', 1),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170f0-df52-7a60-b3b1-58bea98b2bcd.webp', 'Page 3', 2),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170f0-f098-721f-b1b6-fa3b8408a9a6.webp', 'Page 4', 3),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170f1-023a-7604-b338-a5cf3d2cdb26.webp', 'Page 5', 4),
  ('https://media.discovr.in/cdn-cgi/image/width=1600,fit=scale-down,format=auto,quality=85,metadata=none/images/01a170f1-14a6-71e4-8640-1f325854b9cf.webp', 'Page 6', 5)
) as v(src, label, sort_order)
where e.slug = 'raeeth' and not exists (select 1 from experience_menu_pages p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Slow Tide"}, {"type": "line"}, {"type": "quote", "text": "The menu draws from Goa, Mangalore, & Sri Lanka, with dishes that put a creative spin on regional favorites. Designed with natural materials & open spaces, it’s a spot for long lunches, cocktails by the sea,", "plain": true}, {"type": "photo", "src": "https://media.discovr.in/images/01a17193-bd5c-7bf2-bdff-264be24af723.webp", "alt": "sea"}, {"type": "text", "paragraphs": [{"text": "Price:", "strong": true}, {"text": "3000, two people (approx)"}]}]'::jsonb) where slug = 'slow-tide';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a1718f-7a40-7a4a-8bed-9cda18c8e0e8.webp', 'Slow Tide', 0, true),
  ('https://media.discovr.in/images/01a1718f-43c7-7bf3-a5df-66e3445e907d.webp', 'Slow Tide', 1, false),
  ('https://media.discovr.in/images/01a1718f-b507-7428-9cfe-3a51a4e008de.webp', 'Slow Tide', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = 'slow-tide' and not exists (select 1 from experience_photos p where p.experience_id = e.id);
insert into experience_menu_pages (experience_id, src, label, alt, sort_order)
select e.id, v.src, v.label, e.title || ' menu, page ' || (v.sort_order + 1), v.sort_order from experiences e,
(values
  ('https://media.discovr.in/images/01a17192-0a40-7bf1-aa65-81812ecf2087.avif', 'Page 1', 0),
  ('https://media.discovr.in/images/01a17192-22c7-7c3a-8b95-7c468bd82225.avif', 'Page 2', 1),
  ('https://media.discovr.in/images/01a17192-3362-73b6-9f69-3fb54d3c8758.avif', 'Page 3', 2),
  ('https://media.discovr.in/images/01a17192-42c7-7990-87fc-c7aaec49a216.avif', 'Page 4', 3),
  ('https://media.discovr.in/images/01a17192-518d-778e-8f5a-c0d04f81a7c7.avif', 'Page 5', 4),
  ('https://media.discovr.in/images/01a17192-6085-7f2a-98f4-74da7f20a728.avif', 'Page 6', 5),
  ('https://media.discovr.in/images/01a17192-7631-727d-b378-d72dc5006526.avif', 'Page 7', 6)
) as v(src, label, sort_order)
where e.slug = 'slow-tide' and not exists (select 1 from experience_menu_pages p where p.experience_id = e.id);

update experiences set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('blocks', '[{"type": "heading", "level": "section", "text": "Skim Through Waves"}, {"type": "line"}, {"type": "quote", "text": "Strap in, find your balance, & ride the wake like you own the lake.", "plain": true}, {"type": "line"}, {"type": "text", "paragraphs": [{"text": "About", "strong": true}, {"text": "A port where you ride a board across the water while being pulled by a cable or boat. Think surfing meets snowboarding, with a few splashes, some serious thrills, & plenty of room to learn new tricks."}]}, {"type": "photo", "src": "https://media.discovr.in/images/01a171fb-1c58-7bb7-b782-eae0658eb92f.png", "alt": "wakeboarding"}, {"type": "text", "paragraphs": [{"text": "Age", "strong": true}, {"text": "10+"}, {"text": "Fitness Levels", "strong": true}, {"text": "Easy - Moderate"}]}, {"type": "forNotFor", "columns": [{"title": "What''s Included", "tone": "included", "items": ["Helmet", "Life Jacket", "Board Rental"]}, {"title": "What''s Not Included", "tone": "bring", "items": ["Swimwear / Outfit for Wakebaording"]}]}, {"type": "line"}, {"type": "heading", "level": "section", "text": "The Process"}, {"type": "steps", "items": [{"marker": "1.", "title": "Find It On Discovr", "caption": "Pick wakeboarding from the curated list"}, {"marker": "2.", "title": "Book from Website", "caption": "Confirm you slot from the website"}, {"marker": "3.", "title": "3. Show up & ride", "caption": "Arrive at your slot time. After a short briefing, you’re on the board."}]}, {"type": "callout", "tone": "heads_up", "title": "Health Advisory", "paragraphs": ["Guests with a heart condition, asthma, back, neck or joint problems, or any other medical condition should inform the host before booking. Wakeboarding is not recommended during pregnancy."]}, {"type": "line"}, {"type": "checklist", "title": "Things To Get With You", "items": ["Extra Pair of Clothes", "Towels", "Sunscreen"]}, {"type": "callout", "tone": "tip", "title": "Note", "paragraphs": ["Be there 15 mins before your slot", "There is one instructor for every 5 students"]}, {"type": "line"}, {"type": "heading", "level": "small", "text": "FAQ''s"}, {"type": "faq", "items": [{"q": "How will my session look like?", "a": "You will have a 30 mins briefing session, followed by a 30 min wakeboarding session on the water."}, {"q": "Can a beginner or a child Wakeboard?", "a": "Yes. No previous experience is needed for the Beginner Session, and children aged 10+ can ride with an adult present."}, {"q": "Do I need to know how to swim?", "a": "Not for the Beginner Session — a life jacket and instructor support are included. Swimming is required for both Expert packages."}]}]'::jsonb) where slug = '101-wakepark';
insert into experience_photos (experience_id, src, alt, sort_order, is_cover)
select e.id, v.src, v.alt, v.sort_order, v.is_cover from experiences e,
(values
  ('https://media.discovr.in/images/01a171f6-a24a-7378-9d7e-895f8f903868.png', 'Chase the Wake at 101 Wakepark', 0, true),
  ('https://media.discovr.in/images/01a171f6-02b8-7624-b576-aeb2e3cb0a7a.webp', 'Chase the Wake at 101 Wakepark', 1, false),
  ('https://media.discovr.in/images/01a171f6-1ff3-76de-b960-ab1f20f9f6d4.webp', 'Chase the Wake at 101 Wakepark', 2, false)
) as v(src, alt, sort_order, is_cover)
where e.slug = '101-wakepark' and not exists (select 1 from experience_photos p where p.experience_id = e.id);

update hosts set business_name = 'Shilpa Shetty', credit = 'owned', verified = true, instagram_handle = 'theshilpashetty'
where id = (select host_id from experiences where slug = 'bastian-riviera');

commit;
