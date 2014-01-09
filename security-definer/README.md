## Create private visualizations

### Row level security

This will show you how to create visualizations with row-level control over which users can see what. There are two examples for row-level security on single and private multiple tables, a simple [SingleTable](row-level/README.md) example and then building on that a [MultiTable](row-level/MultiTable.md) example. They are just what they say, examples that have a single private table or multiple private tables that can be accessed by defined users with known keys. 

## Features

 * Multiple users with unique keys
 * Ability to cycle keys 
 * Group level permissions so multiple users can share the same permissions
 * Ability to use data from private maps in both visualizations and over the SQL API

### Table level security

There is also an example for creating table-level group security, such that a member of a group either has access to a complete table or no access. This is easier to manage than the row-level security and will fit many use cases. You can find that example here, [Table Level Permissions](table-level/README.md).

