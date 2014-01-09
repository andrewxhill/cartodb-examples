## Minimal Read-only Example 

This shows how to create a simple application using a security definer to access data from private tables. Access to private data is granted to Groups based on a group_id. Each member is granted access to their group level security based on their username and secret. 

## User Setup

1. Create a private table called ```private_user_list``` *
2. Remove any unwanted columns from private_user_list
3. Run the following, 
```sql

   ALTER TABLE private_user_list ADD COLUMN username text; 
   ALTER TABLE private_user_list ADD COLUMN secret text; 
   ALTER TABLE private_user_list ADD COLUMN group_id int
```
4. Populate the private_user_list with 3 users,
```sql

   INSERT into private_user_list 
   (username, secret, group_id) 
   VALUES
   ('bob', 'D7CAA28CE867A4A6DA2E510C7EDB4E7726C67720F6A6A93C9CE9D04DDB42E0BA', 1),
   ('sally', '64FE9D79128C2BC31A777C2A8423AA2A6C79065B499BF081873FB04DAB61FFEC', 2),
   ('henry', 'FCDFA03DB2822475B0FEB9622E0FBFFB3952F8ED99D78F9F6162CD224333D499', 2) 
```

_1 should be changed to pure SQL pending Ghost Table rake feature deploy_

## Group Setup

You may have noticed that we assigned our users above to two groups, 1 and 2. These groups are where row level permissions are defined. Let's create the necessary table.

1. Create a private table called ```private_groups``` *
2. Run the following to create the necessary columns,
```sql

  ALTER TABLE private_groups ADD COLUMN group_id int; 
  ALTER TABLE private_groups ADD COLUMN description text; 
```
3. Add two new groups 
```sql 

   INSERT INTO private_groups (group_id, description) 
   VALUES (1, 'Management team'),(2, 'Sales team')
```

_1 should be changed to pure SQL pending Ghost Table rake feature deploy_

## Create a new private table

1. Go to common data
2. Import any dataset
3. Rename the table to 'my_private_table'

## Permissions table

You may have noticed that we assigned our users above to two groups, 1 and 2. These groups are where table level permissions are defined. Let's create the necessary table.

1. Create a private table called ```table_permissions``` *
2. Run the following to create the necessary columns,
```sql

  ALTER TABLE table_permissions ADD COLUMN tablename text; 
  ALTER TABLE table_permissions ADD COLUMN group_id INT[]
```
3. Add permissions for a group to a private table 
```sql 

   INSERT INTO table_permissions (tablename, group_id) 
   VALUES ('my_private_table', '{1, 2}')
```

This will give your "management team "(1) and "sales team" (2) as defined in Group Setup above, access to this full table.  

## Create our security definer

```sql

CREATE OR REPLACE FUNCTION AXHGroup_Table(tablename text, username text, secret text)
RETURNS SETOF private_poi
AS $$
DECLARE
  sql text;
  table_id INT;
  group_info RECORD;
  val_list RECORD; 
BEGIN

  -- Check that our username and secret are valid
  sql := 'SELECT group_id FROM public.private_user_list WHERE lower(username) = lower($1) AND secret = $2';
  EXECUTE sql USING username, secret INTO group_info;

  IF group_info IS NULL THEN
    RAISE EXCEPTION 'Authorization failed for partner: %', partner;
  END IF;

  -- Check that data is being requested from a valid table
  sql := 'SELECT cartodb_id FROM public.table_permissions WHERE lower(tablename) = lower($1) AND $2 = ANY(group_id)';
  EXECUTE sql USING tablename, group_info.group_id INTO table_id;

  IF table_id IS NULL THEN
    RAISE EXCEPTION 'Invalid source table: %', tablename;
  END IF;

  sql := 'SELECT * FROM public.'|| tablename;
  FOR val_list IN EXECUTE sql
  LOOP 
    RETURN NEXT val_list; 
  END LOOP; 
  RETURN; 
END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER;
```

## Test the Security Definer

1. Go to your map of my_private_table
2. Open the SQL editor and run

```sql

SELECT * FROM AXHGroup_Table('my_private_table', 'sally', '64FE9D79128C2BC31A777C2A8423AA2A6C79065B499BF081873FB04DAB61FFEC')
```

You should see the full map of my_private_table


## Create a public table to ensure cache invalidation

This table will simply be updated with a new timestamp anytime one of our privete tables is changed

1. Go to the empty public table we created ```public_table_cache```
2. Add a column called last_update type date
3. Add a single row,
```sql

    INSERT INTO public.public_table_cache (last_update) VALUES (now())
```

## Create a trigger

This trigger will let us invalidate our empty table whenever our private table is updated. It will help us keep our visualization in sync even though our data isn't available in the public viz! A trick :)

Let's create a function to do the update of our public table,

```sql

CREATE OR REPLACE FUNCTION AXHTableUpdate_Trigger()
RETURNS trigger
AS $$
DECLARE
  sql text;
BEGIN

  IF TG_TABLE_SCHEMA != 'public'
    RAISE EXCEPTION 'Trigger originating from invalid source schema';
  END IF;

  sql := 'UPDATE public.public_table_cache SET last_update = now()';
  EXECUTE sql;

  RETURN NULL; 
END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER;
```

_This function updates a small public table ```public_table_cache``` that we use in our example visualization to link updates in private tables to invalidation of public caches. See [examples/table-level-security.html](examples/table-level-security.html) to see the run-time visualization with 2 layers, 1 being the public table and the second being the function call._

Next let's add some triggers. First to my_private_table,

```sql

CREATE TRIGGER invalidate_public_table_cache_from_private
    AFTER INSERT OR UPDATE OR DELETE ON my_private_table
    FOR EACH STATEMENT
    EXECUTE PROCEDURE AXHTableUpdate_Trigger();
```

Next our table permissions,

```sql

CREATE TRIGGER invalidate_public_table_cache_from_private
    AFTER INSERT OR UPDATE OR DELETE ON table_permissions
    FOR EACH STATEMENT
    EXECUTE PROCEDURE AXHTableUpdate_Trigger();
```

Then our user table,

```sql

CREATE TRIGGER invalidate_public_table_cache_from_private_user_list
    AFTER INSERT OR UPDATE OR DELETE ON private_user_list
    FOR EACH STATEMENT
    EXECUTE PROCEDURE AXHTableUpdate_Trigger();
```

Finally our group table

```sql

CREATE TRIGGER invalidate_public_table_cache_from_private_groups
    AFTER INSERT OR UPDATE OR DELETE ON private_groups
    FOR EACH STATEMENT
    EXECUTE PROCEDURE AXHTableUpdate_Trigger();
```

## See it live

You can see my running app now on 

[http://andrewxhill.com/cartodb-examples/security-definer/table-level/examples/table-level-security.html](http://andrewxhill.com/cartodb-examples/security-definer/table-level/examples/table-level-security.html)

It creates a visualization from our empty dataset, then applies a query based on the username key pair provided on entry. 