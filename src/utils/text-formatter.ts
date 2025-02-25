export const processSpecialTags = (text: string) => {
  return (
    text
      // 텍스트 스타일 관련 태그
      .replace(/{it}(.*?){\/it}/g, "<i>$1</i>") // 이탤릭체
      .replace(/{b}(.*?){\/b}/g, "<b>$1</b>") // 볼드체
      .replace(/{inf}(.*?){\/inf}/g, "<sub>$1</sub>") // 아래 첨자
      .replace(/{sup}(.*?){\/sup}/g, "<sup>$1</sup>") // 위 첨자
      .replace(/{sc}(.*?){\/sc}/g, '<span class="small-caps">$1</span>') // 작은 대문자

      // 구조적 의미 태그
      .replace(/{bc}/g, ":") // 콜론 앞의 구분자
      .replace(/{dx}(.*?){\/dx}/g, '<span class="derivative">$1</span>') // 파생어 구분
      .replace(/{sx}(.*?){\/sx}/g, '<span class="synonym">$1</span>') // 동의어 구분
      .replace(/{phrase}(.*?){\/phrase}/g, '<span class="phrase">$1</span>') // 구문 구분
      .replace(/{wi}(.*?){\/wi}/g, '<span class="word-index">$1</span>') // 단어 인덱스
      .replace(/{gloss}(.*?){\/gloss}/g, '<span class="gloss">$1</span>') // 의미 설명
      .replace(/{qword}(.*?){\/qword}/g, '<span class="quoted-word">$1</span>') // 인용구 내 강조 단어
      .replace(
        /{parahw}(.*?){\/parahw}/g,
        '<span class="parallel-headword">$1</span>'
      ) // 병렬 표제어
      .replace(/{mat}(.*?){\/mat}/g, '<span class="mathematical">$1</span>') // 수학 기호
      .replace(/{ldquo}/g, '"') // 왼쪽 큰따옴표
      .replace(/{rdquo}/g, '"') // 오른쪽 큰따옴표
      .replace(/{nbsp}/g, " ") // 줄바꿈 없는 공백

      // 참조 태그
      .replace(/{a_link}(.*?){\/a_link}/g, '<a class="word-link">$1</a>') // 단어 링크
      .replace(/{d_link}(.*?){\/d_link}/g, '<a class="definition-link">$1</a>') // 정의 링크
      .replace(
        /{i_link}(.*?){\/i_link}/g,
        '<a class="illustration-link">$1</a>'
      ) // 이미지 링크
      .replace(/{et_link}(.*?){\/et_link}/g, '<a class="etymology-link">$1</a>') // 어원 링크
      .replace(/{ma}(.*?){\/ma}/g, '<a class="more-at">$1</a>') // "more at" 링크
      .replace(
        /{dx_def}(.*?){\/dx_def}/g,
        '<span class="derivative-definition">$1</span>'
      ) // 파생어 정의
      .replace(
        /{dx_ety}(.*?){\/dx_ety}/g,
        '<span class="derivative-etymology">$1</span>'
      ) // 파생어 어원

      // 발음 관련 태그
      .replace(/{ptr}(.*?){\/ptr}/g, '<span class="pronunciation">$1</span>') // 발음 기호
      .replace(/{accent}(.*?){\/accent}/g, '<span class="accent">$1</span>') // 강세 표시
      .replace(
        /{dxt\|(.*?)\|(.*?)}/g,
        // '<a class="cross-reference">$1</a>'
        "$1"
      ) // 교차 참조

      // 기타 형식 태그
      .replace(/{ds}/g, "—") // 대시
      .replace(/{sds}/g, "—") // 짧은 대시
      .replace(/{p_br}/g, "<br/>") // 단락 구분선
      .replace(/{bold}(.*?){\/bold}/g, "<b>$1</b>") // 볼드체 (대체)
      .replace(/{it_old}(.*?){\/it_old}/g, "<i>$1</i>") // 이전 이탤릭체
      .replace(/{sxn}/g, "") // 동의어 번호 구분자
      .replace(/{qdate}/g, "") // 인용 날짜 구분자
      .replace(/{(?:start|end)_indent}/g, "") // 들여쓰기 태그
      .replace(/{(?:start|end)_para}/g, "") // 단락 태그
      .replace(/{[^}]*}/g, "")
  ); // 기타 미처리된 태그 제거
}; 