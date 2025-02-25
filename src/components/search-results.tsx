import { SearchResult } from "@/types/dictionary";
import { FormattedText } from "@/components/formatted-text";
import { processSpecialTags } from "@/utils/text-formatter";
import { useState } from "react";
import api from "@/lib/axios";
import type { AxiosError } from "axios";

interface SearchResultsProps {
  results: SearchResult[];
  displayedQuery: string;
  error: string | null;
}

interface TranslationState {
  isLoading: boolean;
  error: string | null;
  translations: Record<string, string>;
  isTranslated: boolean;
}

const translateTexts = async (texts: string[]) => {
  try {
    const processedTexts = texts.map((text) => processSpecialTags(text));

    const response = await api.post("/translation/translate/", {
      texts: processedTexts,
      target_lang: "KO",
      source_lang: "EN",
    });

    if (!response.data) {
      throw new Error("번역에 실패했습니다.");
    }

    const translationMap: Record<string, string> = {};

    texts.forEach((originalText, index) => {
      if (response.data[index]) {
        translationMap[originalText] = response.data[index].translated_text;
      }
    });

    return translationMap;
  } catch (error) {
    if (error instanceof Error) {
      if ((error as AxiosError)?.response?.status === 429) {
        throw new Error("요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.");
      }
      throw error;
    }
    throw new Error("번역에 실패했습니다.");
  }
};

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  displayedQuery,
  error,
}) => {
  const [translations, setTranslations] = useState<
    Record<number, TranslationState>
  >({});

  const handleTranslate = async (index: number, result: SearchResult) => {
    if (translations[index]?.isTranslated) {
      setTranslations((prev) => ({
        ...prev,
        [index]: {
          isLoading: false,
          error: null,
          translations: {},
          isTranslated: false,
        },
      }));
      return;
    }

    const textsToTranslate = new Set<string>();

    result.definition_sections.forEach((section) => {
      section.sense_sequences.forEach((sequence) => {
        sequence.forEach((sense) => {
          if (sense.defining_text?.text?.[0]) {
            textsToTranslate.add(sense.defining_text.text.join(" "));
          }
          sense.defining_text?.verbal_illustrations?.forEach((ill) => {
            if (ill.text) textsToTranslate.add(ill.text);
          });
          sense.defining_text?.usage_notes?.forEach((note) => {
            if (note.text) textsToTranslate.add(note.text);
            note.examples?.forEach((example) => {
              if (example) textsToTranslate.add(example);
            });
          });
          if (sense.divided_sense) {
            textsToTranslate.add(
              sense.divided_sense.defining_text.text.join(" ")
            );
            sense.divided_sense.defining_text.verbal_illustrations?.forEach(
              (ill) => {
                if (ill.text) textsToTranslate.add(ill.text);
              }
            );
          }
        });
      });
    });

    // result.idioms?.forEach((idiom) => {
    //   idiom.definitions.forEach((def) => {
    //     if (def.text) textsToTranslate.add(def.text);
    //   });
    //   idiom.verbal_illustrations.forEach((ill) => {
    //     if (ill.text) textsToTranslate.add(ill.text);
    //   });
    // });

    setTranslations((prev) => ({
      ...prev,
      [index]: {
        isLoading: true,
        error: null,
        translations: {},
        isTranslated: false,
      },
    }));

    try {
      const translationMap = await translateTexts(Array.from(textsToTranslate));
      setTranslations((prev) => ({
        ...prev,
        [index]: {
          isLoading: false,
          error: null,
          translations: translationMap,
          isTranslated: true,
        },
      }));
    } catch (error) {
      setTranslations((prev) => ({
        ...prev,
        [index]: {
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
          translations: {},
          isTranslated: false,
        },
      }));
    }
  };

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="pt-[60px] text-center">
        <p className="text-gray-500">검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="lg:w-[720px] md:w-[600px] sm:w-[480px] w-[360px]">
        <p className="text-3xl font-bold pl-5 text-foreground">
          {displayedQuery}
        </p>
      </div>
      {results.map((result, index) => (
        <div
          key={index}
          className="lg:w-[720px] md:w-[600px] sm:w-[480px] w-[360px] bg-background shadow-custom p-6 mt-10 rounded-[25px] shadow-md"
        >
          <h2 className="text-xl font-semibold mb-2 flex items-center justify-between">
            <div>
              {index + 1}. {result.headword_info.headword} [
              {result.part_of_speech}]
              {result.grammatical_note && ` [${result.grammatical_note}]`}
            </div>
            <button
              onClick={() => handleTranslate(index, result)}
              className={`px-4 py-2 text-white rounded-lg transition-colors text-sm ${
                translations[index]?.isTranslated
                  ? "bg-gray-500 hover:bg-gray-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={translations[index]?.isLoading}
            >
              {translations[index]?.isLoading
                ? "번역 중..."
                : translations[index]?.isTranslated
                ? "원문 보기"
                : "번역하기"}
            </button>
          </h2>
          {translations[index]?.error && (
            <div className="mt-2 mb-4 p-3 bg-red-100 rounded-lg">
              <p className="text-red-600">{translations[index].error}</p>
            </div>
          )}

          {/* 라벨 */}
          {result.labels && result.labels.length > 0 && (
            <div className="text-sm text-gray-500 mb-2">
              {result.labels.join(", ")}
            </div>
          )}

          {/* 정의 섹션 */}
          {result.definition_sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-12">
              {section.sense_sequences.map((sequence, sequenceIndex) => (
                <div key={sequenceIndex} className="space-y-2">
                  {sequence.map((sense, senseIndex) => (
                    <div key={senseIndex}>
                      <p className={`text-foreground font-medium ml-2`}>
                        {/* 번호 표시 */}
                        {sense.sense_number.replace(/[0-9]/g, "") &&
                          senseIndex === 0 && (
                            <p className="text-foreground font-medium ml-2">
                              {sequenceIndex + 1 + "."}
                            </p>
                          )}

                        {/* 알파벳이 없는 경우 */}
                        {!sense.sense_number.replace(/[0-9]/g, "") && (
                          <p className="text-foreground font-medium ml-2">
                            {sequenceIndex + 1 + "."}
                            {sense.labels?.[0] || sense.grammatical_label ? (
                              <>
                                {sense.labels?.[0] && (
                                  <span className="ml-2 text-green-500">
                                    [{sense.labels[0].toUpperCase()}]
                                  </span>
                                )}
                                {sense.grammatical_label && (
                                  <span className="ml-2 text-blue-500">
                                    [{sense.grammatical_label}]
                                  </span>
                                )}
                                <p className="text-foreground font-medium ml-6">
                                  <FormattedText
                                    text={
                                      translations[index]?.translations[
                                        (sense.defining_text?.text?.[0]
                                          ? sense.defining_text.text.join(" ")
                                          : sense.defining_text
                                              ?.usage_notes?.[0]?.text) || ""
                                      ] ||
                                      (sense.defining_text?.text?.[0]
                                        ? sense.defining_text.text.join(" ")
                                        : sense.defining_text?.usage_notes?.[0]
                                            ?.text) ||
                                      ""
                                    }
                                    className="text-foreground"
                                  />
                                </p>
                              </>
                            ) : (
                              <span className="ml-2">
                                <FormattedText
                                  text={
                                    translations[index]?.translations[
                                      (sense.defining_text?.text?.[0]
                                        ? sense.defining_text.text.join(" ")
                                        : sense.defining_text?.usage_notes?.[0]
                                            ?.text) || ""
                                    ] ||
                                    (sense.defining_text?.text?.[0]
                                      ? sense.defining_text.text.join(" ")
                                      : sense.defining_text?.usage_notes?.[0]
                                          ?.text) ||
                                    ""
                                  }
                                  className="text-foreground"
                                />
                              </span>
                            )}
                          </p>
                        )}

                        {/* 알파벳과 내용 표시 */}
                        {sense.sense_number.replace(/[0-9]/g, "") && (
                          <>
                            <p className="text-foreground ml-8">
                              <span className="font-medium">
                                {sense.sense_number.replace(/[0-9]/g, "")}.
                              </span>
                              {sense.labels?.[0] || sense.grammatical_label ? (
                                <>
                                  {sense.labels?.[0] && (
                                    <span className="ml-2 text-green-500">
                                      [{sense.labels[0].toUpperCase()}]
                                    </span>
                                  )}
                                  {sense.grammatical_label && (
                                    <span className="ml-2 text-blue-500">
                                      [{sense.grammatical_label}]
                                    </span>
                                  )}
                                  <p className="text-foreground ml-6 mt-1">
                                    <FormattedText
                                      text={
                                        translations[index]?.translations[
                                          (sense.defining_text?.text?.[0]
                                            ? sense.defining_text.text.join(" ")
                                            : sense.defining_text
                                                ?.usage_notes?.[0]?.text) || ""
                                        ] ||
                                        (sense.defining_text?.text?.[0]
                                          ? sense.defining_text.text.join(" ")
                                          : sense.defining_text
                                              ?.usage_notes?.[0]?.text) ||
                                        ""
                                      }
                                      className="text-foreground"
                                    />
                                  </p>
                                </>
                              ) : (
                                <span className="ml-2">
                                  <FormattedText
                                    text={
                                      translations[index]?.translations[
                                        (sense.defining_text?.text?.[0]
                                          ? sense.defining_text.text.join(" ")
                                          : sense.defining_text
                                              ?.usage_notes?.[0]?.text) || ""
                                      ] ||
                                      (sense.defining_text?.text?.[0]
                                        ? sense.defining_text.text.join(" ")
                                        : sense.defining_text?.usage_notes?.[0]
                                            ?.text) ||
                                      ""
                                    }
                                    className="text-foreground"
                                  />
                                </span>
                              )}
                            </p>
                          </>
                        )}
                      </p>

                      {/* 용례 */}
                      {(sense.defining_text?.text?.[0]
                        ? sense.defining_text.verbal_illustrations
                        : sense.defining_text?.usage_notes?.[0]?.examples) && (
                        <ul
                          className={`mt-2 space-y-4 ${
                            sense.sense_number.replace(/[0-9]/g, "")
                              ? "ml-12"
                              : "ml-8"
                          }`}
                        >
                          {(sense.defining_text?.text?.[0]
                            ? sense.defining_text.verbal_illustrations?.map(
                                (illustration) => illustration.text
                              )
                            : sense.defining_text?.usage_notes?.[0]?.examples
                          )?.map((text, exampleIndex) => (
                            <li
                              key={exampleIndex}
                              className="text-sm text-gray-600 ml-6"
                            >
                              <FormattedText
                                text={
                                  translations[index]?.translations[text] ||
                                  text
                                }
                                className="text-gray-600"
                              />
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* 사용 주석 */}
                      {sense.defining_text?.usage_notes &&
                        sense.defining_text?.text?.[0] && (
                          <div
                            className={`mt-4 mb-4 space-y-1 ${
                              sense.sense_number.replace(/[0-9]/g, "")
                                ? "ml-12"
                                : "ml-8"
                            }`}
                          >
                            {sense.defining_text.usage_notes.map(
                              (note, noteIndex) => (
                                <div key={noteIndex}>
                                  <p className="text-foreground font-medium ml-4">
                                    [
                                    <FormattedText
                                      text={
                                        translations[index]?.translations[
                                          note.text
                                        ] || note.text
                                      }
                                      className="text-foreground"
                                    />
                                    ]
                                  </p>
                                  {note.examples &&
                                    note.examples.length > 0 && (
                                      <ul className="mt-2 ml-8 space-y-4">
                                        {note.examples.map(
                                          (example, exampleIndex) => (
                                            <li
                                              key={exampleIndex}
                                              className="text-sm text-gray-600"
                                            >
                                              <FormattedText
                                                text={
                                                  translations[index]
                                                    ?.translations[example] ||
                                                  example
                                                }
                                                className="text-gray-600"
                                              />
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    )}
                                </div>
                              )
                            )}
                          </div>
                        )}

                      {/* 분할된 의미 */}
                      {sense.divided_sense && (
                        <div className="mt-2 ml-6">
                          <p className="text-foreground">
                            <span className="italic">
                              {sense.divided_sense.sense_divider}:
                            </span>
                            <FormattedText
                              text={
                                translations[index]?.translations[
                                  sense.divided_sense.defining_text.text.join(
                                    " "
                                  )
                                ] ||
                                sense.divided_sense.defining_text.text.join(" ")
                              }
                              className="text-foreground"
                            />
                          </p>
                          {sense.divided_sense.defining_text
                            .verbal_illustrations &&
                            sense.divided_sense.defining_text
                              .verbal_illustrations.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {sense.divided_sense.defining_text.verbal_illustrations.map(
                                  (illustration, illIndex) => (
                                    <li
                                      key={illIndex}
                                      className="text-sm text-gray-600 italic ml-6"
                                    >
                                      <FormattedText
                                        text={
                                          translations[index]?.translations[
                                            illustration.text
                                          ] || illustration.text
                                        }
                                        className="text-gray-600"
                                      />
                                    </li>
                                  )
                                )}
                              </ul>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}

          {/* 관용구 섹션 */}
          {/*
          {result.idioms && result.idioms.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Idioms:</h3>
              {result.idioms.map((idiom, idx) => (
                <div key={idx} className="ml-4 mb-4">
                  <p className="font-medium text-lg">{idiom.phrase}</p>

                  {idiom.phrase_variants.length > 0 && (
                    <div className="text-sm text-gray-600 mb-2">
                      {idiom.phrase_variants.map((variant, varIdx) => (
                        <span key={varIdx} className="mr-4">
                          {variant.label && (
                            <span className="italic">{variant.label} </span>
                          )}
                          {variant.text}
                        </span>
                      ))}
                    </div>
                  )}

                  {idiom.subject_status_labels &&
                    idiom.subject_status_labels.length > 0 && (
                      <div className="text-sm text-blue-500 mb-2">
                        [{idiom.subject_status_labels.join(", ")}]
                      </div>
                    )}

                  {idiom.definitions.map((def, defIdx) => (
                    <div key={defIdx} className="ml-2 mb-2">
                      <FormattedText
                        text={
                          translations[index]?.translations[def.text] ||
                          def.text
                        }
                        className="text-foreground"
                      />
                    </div>
                  ))}

                  {idiom.verbal_illustrations &&
                    idiom.verbal_illustrations.length > 0 &&
                    idiom.verbal_illustrations.map((ill, illIdx) => (
                      <div key={illIdx} className="ml-4 text-sm text-gray-600">
                        <FormattedText
                          text={
                            translations[index]?.translations[ill.text] ||
                            ill.text
                          }
                          className="text-gray-600"
                        />
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}
          */}

          {/* 어원 정보 */}
          {result.etymology && result.etymology.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Etymology:</h3>
              {result.etymology.map((etym, idx) => (
                <p key={idx} className="ml-4">
                  <FormattedText
                    text={translations[index]?.translations[etym] || etym}
                    className="text-foreground"
                  />
                </p>
              ))}
            </div>
          )}

          {/* 최초 사용 시기 */}
          {result.first_use_date && (
            <div className="mt-4">
              <h3 className="font-semibold">First Known Use:</h3>
              <p className="ml-4 text-foreground">
                <FormattedText
                  text={
                    translations[index]?.translations[result.first_use_date] ||
                    result.first_use_date
                  }
                  className="text-foreground"
                />
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
