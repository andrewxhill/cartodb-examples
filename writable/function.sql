-- Create a function withn the security set to Definer so that it can insert
CREATE OR REPLACE FUNCTION AXH_NewMinneapolis(integer, geometry) RETURNS integer
	AS 'INSERT INTO minneapolis (parent_id, the_geom) (SELECT id, geom FROM (SELECT $1 id,$2 geom) a WHERE ST_NPoints(geom) < 100) RETURNING cartodb_id;'
	LANGUAGE SQL 
	SECURITY DEFINER
	RETURNS NULL ON NULL INPUT;
--Grant access to the public user
GRANT EXECUTE ON FUNCTION AXH_NewMinneapolis(integer, geometry) TO publicuser;
