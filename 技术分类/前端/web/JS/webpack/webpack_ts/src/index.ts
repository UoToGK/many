interface User{
    name:string;
    age:number;
}

class System{
    private user:User
    constructor(user:User){
        this.user=user;
    }
    get User(){
        return this.user;
    }
    set User(newUser:User){
        this.user=newUser
    }
}
function getSys(){
    return new System({name:'pig',age:12})
}
console.log(getSys())