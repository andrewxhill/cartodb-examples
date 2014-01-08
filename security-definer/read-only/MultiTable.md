## Multitable example

If you want to create maps from more than one private table we can easily modify the simple example in [README.md](README.md) to do the trick.

## Create a new private table to store all date tables for select access

1. Create a private table called ```private_data_tables``` *
2. Remove any unwanted columns from private_data_tables
3. Run the following, 
```sql

   ALTER TABLE private_data_tables ADD COLUMN tablename text; 
```
4. Populate the private_user_list with 1 table,
```sql

   INSERT into private_data_tables 
   (tablename) 
   VALUES
   ('private_poi') 
```

_1 should be changed to pure SQL pending Ghost Table rake feature deploy_

## Add a trigger for private_data_tables

This way you can invalidate caches if you add or remove datasets from your table list in private_data_tables.

```sql

CREATE TRIGGER invalidate_user_poi_from_private_user_list
    AFTER INSERT OR UPDATE OR DELETE ON private_data_tables
    FOR EACH STATEMENT
    EXECUTE PROCEDURE AXHUpdate_Trigger();
```

## Update our security definer

```sql

CREATE OR REPLACE FUNCTION AXHGroup_POI(tablename text, username text, secret text)
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
  sql := 'SELECT cartodb_id FROM public.private_data_tables WHERE lower(tablename) = lower($1)';
  EXECUTE sql USING tablename INTO table_id;

  IF table_id IS NULL THEN
    RAISE EXCEPTION 'Invalid source table: %', tablename;
  END IF;

  sql := 'SELECT * FROM public.'|| tablename ||' WHERE '||group_info.group_id||' = ANY(group_id)';
  FOR val_list IN EXECUTE sql
  LOOP 
    RETURN NEXT val_list; 
  END LOOP; 
  RETURN; 
END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER;
```

## Add new tables with private data

You can now add any new private table with group defined data access to your account. To do so assuming your new data table is named ```new_table_name```,

1. Create the table with the desired tablename, new_table_name
2. Ensure that the new table has a column for group IDS
```sql

  ALTER TABLE new_table_name ADD COLUMN group_id INT[]
```
3. Update row level permission with SQL, e.g.
```sql

  UPDATE new_table_name SET group_id = '{1}'
```
4. Add the tablename as a new row in your private_data_tables
5. Add a new trigger to the table for public cache invalidation

```sql

CREATE TRIGGER invalidate_user_poi_from_private
    AFTER INSERT OR UPDATE OR DELETE ON new_table_name
    FOR EACH STATEMENT
    EXECUTE PROCEDURE AXHUpdate_Trigger();
```


You can see my running app now on 

[http://andrewxhill.com/cartodb-examples/security-definer/read-only/multi-table-security.html](http://andrewxhill.com/cartodb-examples/security-definer/read-only/multi-table-security.html)

It creates a visualization from our empty dataset, then applies a query based on the username key pair provided on entry. 
