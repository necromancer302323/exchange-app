export function OrderBook(orderBook:any){
return  <div>
            <table className="w-full mt-20  bg-slate-800 rounded-md p-1.5 mr-14 ">
              <thead>
                <tr className="text-white">
                  <th>Price</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {orderBook?.asks
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((value: any, index: any) => {
                    return (
                      <tr key={index} className=" text-red-400 text-center ">
                        <td>{value.price}</td>
                        <td>{value.quantity}</td>
                      </tr>
                    );
                  })}
                <tr>
                  <td className="text-3xl text-green-400 text-center">
                    248.26
                  </td>
                </tr>
                {orderBook?.bids
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((value: any, index: any) => {
                    return (
                      <tr key={index} className=" text-green-400 text-center">
                        <td>{value.price}</td>
                        <td>{value.quantity}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
}