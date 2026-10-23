export async function KakaoBookSearch(e: string) {
  const response = await fetch(
    `https://dapi.kakao.com/v3/search/book?target&query=${e}`,
    {
      headers: {
        Authorization: `KakaoAK e0407daa35ec0f411c944b9c12924f8e`,
      },
    }
  );
  const data = await response.json();
  const Datalist = data.documents;

  return Datalist;
}
