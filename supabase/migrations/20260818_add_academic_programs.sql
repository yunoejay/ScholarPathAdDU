-- Academic program taxonomy table for ScholarPath AdDU.
-- Mirrors src/lib/academicPrograms.js so Supabase-backed sessions can load
-- the same program catalog without bundling the list into the frontend.

create table if not exists academic_programs (
  id uuid primary key default gen_random_uuid(),
  value text not null unique,
  label text not null,
  department text not null,
  category text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table academic_programs enable row level security;

drop policy if exists "academic_programs_read_all" on academic_programs;
drop policy if exists "osa_academic_programs_manage" on academic_programs;

create policy "academic_programs_read_all" on academic_programs
for select using (true);
create policy "osa_academic_programs_manage" on academic_programs
for all using (public.current_profile_role() = 'osa_admin') with check (public.current_profile_role() = 'osa_admin');

-- Seed records matching the static catalog in src/lib/academicPrograms.js.
insert into academic_programs (value, label, department, category, sort_order) values
('BS Architecture', 'BS Architecture', 'School of Engineering and Architecture (SEA)', 'Engineering and Architecture', 0),
('BS Aerospace Engineering (Academic Research)', 'BS Aerospace Engineering (Academic Research)', 'School of Engineering and Architecture (SEA)', 'Engineering and Architecture', 1),
('BS Aerospace Engineering (Industry and Technopreneurship)', 'BS Aerospace Engineering (Industry and Technopreneurship)', 'School of Engineering and Architecture (SEA)', 'Engineering and Architecture', 2),
('BS Civil Engineering (Construction Engineering and Management)', 'BS Civil Engineering (Construction Engineering and Management)', 'School of Engineering and Architecture (SEA)', 'Engineering and Architecture', 3),
('BS Civil Engineering (Structural)', 'BS Civil Engineering (Structural)', 'School of Engineering and Architecture (SEA)', 'Engineering and Architecture', 4),
('BS Civil Engineering (Transportation)', 'BS Civil Engineering (Transportation)', 'School of Engineering and Architecture (SEA)', 'Engineering and Architecture', 5),
('BS Chemical Engineering', 'BS Chemical Engineering', 'School of Engineering and Architecture (SEA)', 'Engineering and Architecture', 6),
('BS Computer Engineering', 'BS Computer Engineering', 'School of Engineering and Architecture (SEA)', 'Engineering and Architecture', 7),
('BS Electrical Engineering', 'BS Electrical Engineering', 'School of Engineering and Architecture (SEA)', 'Engineering and Architecture', 8),
('BS Electronics Engineering', 'BS Electronics Engineering', 'School of Engineering and Architecture (SEA)', 'Engineering and Architecture', 9),
('BS Industrial Engineering', 'BS Industrial Engineering', 'School of Engineering and Architecture (SEA)', 'Engineering and Architecture', 10),
('BS Mechanical Engineering', 'BS Mechanical Engineering', 'School of Engineering and Architecture (SEA)', 'Engineering and Architecture', 11),
('BS Robotics Engineering', 'BS Robotics Engineering', 'School of Engineering and Architecture (SEA)', 'Engineering and Architecture', 12),
('AB Anthropology', 'AB Anthropology', 'College of Arts and Sciences (CAS)', 'Social Sciences', 13),
('BS Biology Major in General Biology', 'BS Biology Major in General Biology', 'College of Arts and Sciences (CAS)', 'Natural Sciences and Mathematics', 14),
('BS Biology Major in Medical Biology', 'BS Biology Major in Medical Biology', 'College of Arts and Sciences (CAS)', 'Natural Sciences and Mathematics', 15),
('BS Chemistry', 'BS Chemistry', 'College of Arts and Sciences (CAS)', 'Natural Sciences and Mathematics', 16),
('AB Communications', 'AB Communications', 'College of Arts and Sciences (CAS)', 'Humanities and Letters', 17),
('AB Development Studies', 'AB Development Studies', 'College of Arts and Sciences (CAS)', 'Social Sciences', 18),
('AB Economics', 'AB Economics', 'College of Arts and Sciences (CAS)', 'Social Sciences', 19),
('AB English Language', 'AB English Language', 'College of Arts and Sciences (CAS)', 'Humanities and Letters', 20),
('BS Environmental Science', 'BS Environmental Science', 'College of Computer Studies (CCS)', 'Natural Sciences and Mathematics', 21),
('AB Interdisciplinary Studies Minor in Language and Literature', 'AB Interdisciplinary Studies Minor in Language and Literature', 'College of Arts and Sciences (CAS)', 'Humanities and Letters', 22),
('AB Interdisciplinary Studies Minor in Media and Business', 'AB Interdisciplinary Studies Minor in Media and Business', 'College of Arts and Sciences (CAS)', 'Humanities and Letters', 23),
('AB Interdisciplinary Studies Minor in Media and Philosophy', 'AB Interdisciplinary Studies Minor in Media and Philosophy', 'College of Arts and Sciences (CAS)', 'Humanities and Letters', 24),
('AB Interdisciplinary Studies Minor in Media and Technology', 'AB Interdisciplinary Studies Minor in Media and Technology', 'College of Arts and Sciences (CAS)', 'Humanities and Letters', 25),
('AB Interdisciplinary Studies Minor in Philosophy and Theology', 'AB Interdisciplinary Studies Minor in Philosophy and Theology', 'College of Arts and Sciences (CAS)', 'Humanities and Letters', 26),
('AB International Studies Major in American Studies', 'AB International Studies Major in American Studies', 'College of Arts and Sciences (CAS)', 'Social Sciences', 27),
('AB International Studies Major in Asian Studies', 'AB International Studies Major in Asian Studies', 'College of Arts and Sciences (CAS)', 'Social Sciences', 28),
('AB Islamic Studies Minor in Education', 'AB Islamic Studies Minor in Education', 'College of Arts and Sciences (CAS)', 'Social Sciences', 29),
('BS Mathematics', 'BS Mathematics', 'College of Arts and Sciences (CAS)', 'Natural Sciences and Mathematics', 30),
('AB Philosophy', 'AB Philosophy', 'College of Arts and Sciences (CAS)', 'Humanities and Letters', 31),
('AB Political Science', 'AB Political Science', 'College of Arts and Sciences (CAS)', 'Social Sciences', 32),
('AB Psychology', 'AB Psychology', 'College of Arts and Sciences (CAS)', 'Social Sciences', 33),
('BS Psychology', 'BS Psychology', 'College of Arts and Sciences (CAS)', 'Social Sciences', 34),
('BS Social Work', 'BS Social Work', 'College of Arts and Sciences (CAS)', 'Social Sciences', 35),
('BS Sociology', 'BS Sociology', 'College of Arts and Sciences (CAS)', 'Social Sciences', 36),
('BS Computer Science', 'BS Computer Science', 'College of Computer Studies (CCS)', 'Computer Studies', 37),
('BS Data Science', 'BS Data Science', 'College of Computer Studies (CCS)', 'Computer Studies', 38),
('BS Information Systems', 'BS Information Systems', 'College of Computer Studies (CCS)', 'Computer Studies', 39),
('BS Information Technology', 'BS Information Technology', 'College of Computer Studies (CCS)', 'Computer Studies', 40),
('Bachelor of Elementary Education', 'Bachelor of Elementary Education', 'School of Education (SOE)', 'Education', 41),
('Bachelor of Secondary Education', 'Bachelor of Secondary Education', 'School of Education (SOE)', 'Education', 42),
('Bachelor of Secondary Education Major in English', 'Bachelor of Secondary Education Major in English', 'School of Education (SOE)', 'Education', 43),
('Bachelor of Secondary Education Major in Mathematics', 'Bachelor of Secondary Education Major in Mathematics', 'School of Education (SOE)', 'Education', 44),
('Bachelor of Secondary Education Major in Social Studies', 'Bachelor of Secondary Education Major in Social Studies', 'School of Education (SOE)', 'Education', 45),
('Bachelor of Secondary Education Major in Science', 'Bachelor of Secondary Education Major in Science', 'School of Education (SOE)', 'Education', 46),
('BS Accountancy', 'BS Accountancy', 'College of Business (COB)', 'Accountancy', 47),
('BS Business Management', 'BS Business Management', 'College of Business (COB)', 'Business Administration', 48),
('BS Entrepreneurship', 'BS Entrepreneurship', 'College of Business (COB)', 'Business Administration', 49),
('BS Entrepreneurship Major in Agri-Business', 'BS Entrepreneurship Major in Agri-Business', 'College of Business (COB)', 'Business Administration', 50),
('BS Finance', 'BS Finance', 'College of Business (COB)', 'Business Administration', 51),
('BS Human Resource Development and Management', 'BS Human Resource Development and Management', 'College of Business (COB)', 'Business Administration', 52),
('BS Management Accounting', 'BS Management Accounting', 'College of Business (COB)', 'Accountancy', 53),
('BS Marketing', 'BS Marketing', 'College of Business (COB)', 'Business Administration', 54),
('BS Public Management', 'BS Public Management', 'College of Business (COB)', 'Business Administration', 55),
('BS Nursing', 'BS Nursing', 'School of Nursing (SON)', 'Nursing', 56)
on conflict (value) do update set
  label = excluded.label,
  department = excluded.department,
  category = excluded.category,
  sort_order = excluded.sort_order,
  updated_at = now();