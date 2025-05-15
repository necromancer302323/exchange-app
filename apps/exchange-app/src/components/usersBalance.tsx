export function UsersBalance(inrBalance:any,stockBalance:any,market:string){
return  <div>
            <table className="w-full mt-20  bg-slate-800 rounded-md p-1.5 mr-14 ">
              <thead>
                <tr className="text-white">
                  <th>Balance</th>
                  <th>Locked</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                <td className="text-white 2xl">INR BALANCE</td>
                </tr>
                      <tr key={Math.random()} className="text-slate-400 text-center ">
                        <td>{inrBalance.balance}</td>
                        <td>{inrBalance.Locked}</td>
                      </tr>
                <tr>
                </tr>
                <tr>
                        <td className="text-white 2xl">STOCK BALANCE</td>
                        </tr>
                      <tr key={Math.random()} className=" text-slate-400 text-center">
                        <td>{stockBalance.balance[market||"sol_usdc"]}</td>
                        <td>{stockBalance.Locked}</td>
                      </tr>

              </tbody>
            </table>
          </div>
}