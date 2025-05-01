export interface userBalances{
    userId:string,
    balance:number,
    Locked:number
}
export interface stockBalances{
    userId:string,
    balance:{
        sol_usdc:number,
        tata:number
    },
    Locked:number
}