export async function KakaoAddress(e: string | string[]) {
  const response = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${e}`,
    {
      headers: {
        Authorization: `KakaoAK e0407daa35ec0f411c944b9c12924f8e`,
      },
    },
  );
  const data = await response.json();
  const Datalist = data.documents;

  return Datalist;
}
