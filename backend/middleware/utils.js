   function all_p(f) {
    return new Promise((res, rej) => {
        f.all((err, rec) => {
            if(err) rej(err);
            res(rec)
        })
    })
}

 function get_p(f, r) {
    return new Promise((res, rej) => {
        f.all(r, (err, rec) => {
            if(err) rej(err);
            res(rec)
        })
    })
}

module.exports = {all_p, get_p};