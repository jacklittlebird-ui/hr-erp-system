
-- Step 1: Reassign training_records from duplicate courses to the kept (oldest) course
UPDATE training_records tr
SET course_id = keeper.id
FROM training_courses dup
JOIN (
  SELECT DISTINCT ON (name_en, course_code) id, name_en, course_code
  FROM training_courses
  ORDER BY name_en, course_code, created_at ASC
) keeper ON keeper.name_en = dup.name_en AND keeper.course_code = dup.course_code
WHERE tr.course_id = dup.id
  AND dup.id != keeper.id;

-- Step 2: Delete duplicate training_courses
DELETE FROM training_courses
WHERE id NOT IN (
  SELECT DISTINCT ON (name_en, course_code) id
  FROM training_courses
  ORDER BY name_en, course_code, created_at ASC
);

-- Step 3: Add unique constraint to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS training_courses_dedup_idx ON training_courses (name_en, course_code);
