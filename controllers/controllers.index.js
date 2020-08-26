var repository = require('../repositories/repositories.index');

const indexRepo = new repository();

const login = async function(req, res, next){
    try{
        console.log(req.body.id+","+req.body.pw);
        const id = req.body.id;
        const pw = req.body.pw;
        const result = await indexRepo.login(id,pw);
    
        req.session.user={
          u_id:result[0].u_id,
          name:result[0].name,
          point:result[0].point
        }
        res.redirect('/');
      }catch(e){
        console.log(e+"[1]");
      }
}

const farm = async function(req, res, next){
    try {
        console.log(req.session.user);
        if(!req.session.user){
          res.send('<script>alert("로그인이 필요합니다.");location.href="/login"</script>');
        }else{
        console.log(req.session.user.u_id);
          const u_id=req.session.user.u_id;
          const goods = await indexRepo.allGoods();
          const farms = await indexRepo.farms(u_id);
          const sangchu = await indexRepo.kind(1);
          const reap = await indexRepo.kind(2);
          const baechu = await indexRepo.kind(3);
          const bburi = await indexRepo.kind(4);
          const fruit = await indexRepo.kind(5);
          const hurb = await indexRepo.kind(6);
          console.log(farms);
          res.render('farms', { 
            'session':req.session.user,
            'goods':goods,
            'farms':farms,
            'sangchu':sangchu,
            'reap':reap,
            'baechu':baechu,
            'bburi':bburi,
            'fruit':fruit,
            'hurb':hurb});
        }
        
      } catch (e) {
        console.log(e);
      }
}

module.exports = {login,farm};