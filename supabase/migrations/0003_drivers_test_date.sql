-- Second test date (for goal = 'both', where the learner's and driver's tests
-- are booked separately) plus a fix for the vehicle_code check constraint,
-- which predates the A1/A motorcycle codes and was rejecting them.

alter table public.profiles
  add column if not exists drivers_test_date date;

alter table public.profiles
  drop constraint if exists profiles_vehicle_code_check;

alter table public.profiles
  add constraint profiles_vehicle_code_check
  check (vehicle_code in ('8', '10', '14', 'A1', 'A'));
