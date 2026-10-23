export interface Address {
  id: string; // 주소 고유 ID (UUID 또는 고유 식별자)
  user_id: string; // 유저 ID (auth.users와 연결)
  recipient_name: string; // 수령인 이름
  phone_number: string; // 연락처 (휴대폰 번호)
  //   postal_code: string; // 우편번호 (5자리)
  address_name: string; // 주소 이름 (집, 사무실, 등등)
  addressinfo: string;
  addressdetailinfo: string; // 상세 주소 (동, 호수, 건물명 등)
  is_default: boolean; // 기본 배송지 여부 (true/false)
}
