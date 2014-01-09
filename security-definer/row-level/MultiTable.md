## Multitable example

If you want to create maps from more than one private table we can easily modify the simple example in [README.md](README.md) to do the trick.

## Use a new private table of data.

1. Dubplicate ```private_poi``` from the first tutorial
2. Rename it to ```new_table_name```

## Create a new generic security checking function

```sql

CREATE OR REPLACE FUNCTION AXHGroupCheck(username text, secret text)
RETURNS integer
AS $$
DECLARE
  sql text;
  table_id INT;
  group_info RECORD;
BEGIN

  -- Check that our username and secret are valid
  sql := 'SELECT group_id FROM public.private_user_list WHERE lower(username) = lower($1) AND secret = $2';
  EXECUTE sql USING username, secret INTO group_info;

  IF group_info IS NULL THEN
    RAISE EXCEPTION 'Authorization failed for user %', username;
  END IF;

  RETURN group_info.group_id;

END;
$$ LANGUAGE 'plpgsql';
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
4. Add a new trigger to the table for public cache invalidation


## Add new function and trigger for each private table you add


## Update our security definer

```sql

CREATE OR REPLACE FUNCTION AXHNewTableName(username text, secret text)
RETURNS SETOF new_table_name
AS $$
DECLARE
  sql text;
  table_id INT;
  group_id INT;
  val_list RECORD; 
BEGIN
  -- Check that our username and secret are valid
  group_id := AXHGroupCheck(username, secret);

  sql := 'SELECT * FROM public.new_table_name WHERE '||group_id||' = ANY(group_id)';
  FOR val_list IN EXECUTE sql
  LOOP 
    RETURN NEXT val_list; 
  END LOOP; 
  RETURN; 
END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER;
```

You will need to modify this function for each new private table you create. You will want a new function namer, here I called it ```AXHNewTableName``` because my table is named new_table_name. Also, change it internally whenever it says ```new_table_name``` to be equal to the name of your new table. 

Now add a trigger to the new table,

```sql

CREATE TRIGGER invalidate_user_poi_from_private
    AFTER INSERT OR UPDATE OR DELETE ON new_table_name
    FOR EACH STATEMENT
    EXECUTE PROCEDURE AXHUpdate_Trigger();
```

Again, you need to add a trigger for each new private table you add to your database. 

## See it live

You can see my running app now on 

[http://andrewxhill.com/cartodb-examples/security-definer/row-level/examples/multi-table-security.html](http://andrewxhill.com/cartodb-examples/security-definer/row-level/examples/multi-table-security.html)

It creates a visualization from our empty dataset, then applies a query based on the username key pair provided on entry. 
