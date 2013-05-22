-- Create a function withn the security set to Definer so that it can insert
CREATE OR REPLACE FUNCTION AXH_NewMidWest(integer, geometry) RETURNS integer
	AS 'INSERT INTO midwest (parent_id, the_geom) VALUES($1,$2) RETURNING cartodb_id;'
	LANGUAGE SQL 
	SECURITY DEFINER
	RETURNS NULL ON NULL INPUT;
--Grant access to the public user
GRANT EXECUTE ON FUNCTION AXH_NewMidWest(integer, geometry) TO publicuser;
