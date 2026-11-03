-- Story text blocks say "Price", not "Charges". "Cover Charges" (club entry) stays.

update experiences
set content = replace(content::text, '{"text": "Charges", "strong": true}', '{"text": "Price", "strong": true}')::jsonb
where content::text like '%{"text": "Charges", "strong": true}%';
