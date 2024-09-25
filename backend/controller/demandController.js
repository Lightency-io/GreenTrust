async function demand(req, res, next) {
    const { uuid } = req.body;
    if (!uuid) return res.status(401).end();

    try {
        const file = files[uuid];
        if (!file) {
            return next(new Error("File not found"));
        }

        // Fetch all the data from the table
        const stmt_exp = db.prepare(`SELECT *, SUM(GarantiaSolicitada) as sum FROM ${file.table_id} GROUP BY CodigoPlanta`);
        const recs_exp = await all_p(stmt_exp);

        const stmt_prod = db.prepare(`SELECT * FROM ${file.table_id}`);
        const recs_prod = await all_p(stmt_prod);

        // Combine the data in a format you wish to return
        const responseData = {
            expedicion: recs_exp,
            produccionMensual: recs_prod
        };

        // Send the response
        res.json(responseData);

    } catch (error) {
        console.error("Error fetching data:", error);
        next(error); // Pass the error to the error handler
    }
}


module.exports = {demand};
