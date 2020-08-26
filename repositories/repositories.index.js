var db = require('../configs/db');

class indexRepo{

    async login(id, pw){
        const result = await db.any("select * from users where id=$1 and password=$2",[id,pw]);
        return result;
    }

    async count(u_id){
        const count = await db.any("select count(*) from waters where w_u_id=$1 and date_tf=true",u_id);
        return count;
    }
    
    async allGoods(){
        const result = await db.any("select * from goods where category=1");
        return result;
    }

    async farms(u_id){
        const result = await db.any("select * from farms left join goods on farms.f_g_id = goods.g_id where f_u_id=$1",u_id);
        return result;
    }

    async kind(num){
        const result = await db.any("select * from goods where kind=$1",num);
        return result;
    }
}

module.exports = indexRepo;