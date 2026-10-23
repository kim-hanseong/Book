import OrderPage from "@/components/page/order";
import { getAddressList } from "@/lib/api/addressAction";
import { fetchBuyList } from "@/lib/query/Buy/fetchBuy";

export default async function Page() {
  const [shopData] = await Promise.all([fetchBuyList()]);

  const addressData = await getAddressList();

  return <OrderPage data={shopData} address={addressData} />;
}
