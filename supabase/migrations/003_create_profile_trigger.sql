-- Auto-create profile on new user signup
-- Fixes https://github.com/frankomatic5000/myclipiq/issues/10

-- Trigger function: creates a public.profiles row when a new auth.users row is inserted.
-- Uses security definer so it can write to public.profiles regardless of caller privileges.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'viewer'),
    new.raw_user_meta_data->>'avatar_url',
    now(),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if present so this migration is idempotent.
drop trigger if exists on_auth_user_created on auth.users;

-- Attach trigger after insert on auth.users.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
