## Minimal Read-only Example 

This shows how to create a simple application using a security definer to access data from private tables. Access to private data is granted to Groups based on a group_id. Each member is granted access to their group level security based on their username and secret. 

## User Setup

1. Create a private table called ```private_user_list``` 
2. Remove any unwanted columns from private_user_list
3. Run the following, 
```sql
   ALTER TABLE private_user_list ADD COLUMN username text; ALTER TABLE private_user_list ADD COLUMN secret text; ALTER TABLE private_user_list ADD COLUMN group_id int
```
4. Populate the private_user_list with 3 users,
```sql
   INSERT into private_user_list (username, secret, group_id) VALUES ('bob', 'D7CAA28CE867A4A6DA2E510C7EDB4E7726C67720F6A6A93C9CE9D04DDB42E0BA', 1),('sally', '64FE9D79128C2BC31A777C2A8423AA2A6C79065B499BF081873FB04DAB61FFEC', 2),('henry', 'FCDFA03DB2822475B0FEB9622E0FBFFB3952F8ED99D78F9F6162CD224333D499', 2) 
```

## Group Setup

You may have noticed that we assigned our users above to two groups, 1 and 2. These groups are where row level permissions are defined. Let's create the necessary table.

1. Create a private table called ```private_groups```
2. Run the following to create the necessary columns,
```sql
	ALTER TABLE private_groups ADD COLUMN group_id int; 
	ALTER TABLE private_groups ADD COLUMN description text; 
```
3. Add two new groups 
```sql 
	INSERT INTO private_groups (group_id, description) VALUES (1, 'Management team'),(2, 'Sales team')
```

## Create a table of private data

1. Go to common data in your dashboard menu. 
2. Import the table of populated places
3. Rename table to ```private_poi```
4. Add a column for group_ids,
```sql
	ALTER TABLE private_poi ADD COLUMN group_id INT[]
```

## Add group_ids to our private_poi table

Here we are going to come up with a fake scheme for our mixed permission data. I'm going to say, everyone on the management team (group_id = 1) can see everything,

```sql
	UPDATE private_poi SET group_id = '{1}'
```

Next, we'll say that everyone on the sales team (group_id = 2) can only see cities in France

```sql
	UPDATE private_poi SET group_id = array_append(group_id, 2) WHERE adm0name = 'France'
```

You can check that it worked by opening your map of your private_poi and running the following,

```sql
    select * from private_poi WHERE 2 = any(group_id)
```

## Create a public visualization

Now we should create a new table that is public and is empty.

1. Create a new table
2. Rename it, user_poi
3. Make it public
4. Create a visualization with it called, 'Group access to POI'

## Create our security definer

```sql
CREATE OR REPLACE FUNCTION AXHGroup_POI(username text, secret text)
RETURNS SETOF private_poi
AS $$
DECLARE
  sql text;
  max_size float8;
  group_info RECORD;
  val_list RECORD; 
BEGIN

  sql := 'SELECT group_id FROM private_user_list WHERE username ILIKE $1 AND secret = $2';
  EXECUTE sql using username, secret INTO group_info;

  IF group_info IS NULL THEN
    RAISE EXCEPTION 'Authorization failed for partner %', partner;
  END IF;
  
  FOR val_list IN 
      SELECT * FROM private_poi WHERE group_info.group_id = ANY(group_id)
  LOOP 
    RETURN NEXT val_list; 
  END LOOP; 
  RETURN; 
END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER;
```

## Test the Security Definer

1. Go to your map of private_poi
2. Open the SQL editor and run,
```sql
SELECT * FROM AXHGroup_POI('sally', '64FE9D79128C2BC31A777C2A8423AA2A6C79065B499BF081873FB04DAB61FFEC')
```

You should see a map of only points in France

## Create a trigger

This trigger will let us invalidate our empty table whenever our private table is updated. It will help us keep our visualization in sync even though our data isn't available in the public viz! A trick :)

1. Go to the empty public table we created ```user_poi```
2. Add a column called last_update type date
3. Add a single row,
```sql
    INSERT INTO user_poi (last_update) VALUES (now())
```
4. Now we need to create a function that runs a similar SQL statement,

```sql
CREATE OR REPLACE FUNCTION AXHUpdate_Trigger()
RETURNS trigger
AS $$
DECLARE
  sql text;
BEGIN

  sql := 'UPDATE user_poi SET last_update = now()';
  EXECUTE sql;

  RETURN NULL; 
END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER;
```

5. Add the trigger to our private_poi

```sql
CREATE TRIGGER invalidate_user_poi_from_private
    AFTER INSERT OR UPDATE OR DELETE ON private_poi
    FOR EACH STATEMENT
    EXECUTE PROCEDURE AXHUpdate_Trigger();
```

6. Add the trigger to our user table

```sql
CREATE TRIGGER invalidate_user_poi_from_private_user_list
    AFTER INSERT OR UPDATE OR DELETE ON private_user_list
    FOR EACH STATEMENT
    EXECUTE PROCEDURE AXHUpdate_Trigger();
```

7. And our group table

```sql
CREATE TRIGGER invalidate_user_poi_from_private_groups
    AFTER INSERT OR UPDATE OR DELETE ON private_groups
    FOR EACH STATEMENT
    EXECUTE PROCEDURE AXHUpdate_Trigger();
```

You can see my running app now on 

