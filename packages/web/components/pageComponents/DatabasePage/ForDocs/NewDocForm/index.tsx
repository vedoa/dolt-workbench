import Button from "@components/Button";
import FormSelect, { Option } from "@components/FormSelect";
import Loader from "@components/Loader";
import TextareaWithMarkdown from "@components/TextareaWithMarkdown";
import {
  DocForDocPageFragment,
  DocType,
  useDocsRowsForDocPageQuery,
} from "@gen/graphql-types";
import useEditDoc from "@hooks/useEditDoc";
import { RefParams } from "@lib/params";
import css from "./index.module.css";

type Props = {
  params: RefParams;
};

type InnerProps = Props & {
  docRows?: DocForDocPageFragment[];
};

function Inner(props: InnerProps) {
  const options = getOptions(props.docRows);
  const { state, setState, onSubmit } = useEditDoc(
    props.params,
    !options[0].isDisabled ? options[0].value : undefined,
  );
  const invalidDocType =
    !state.docType || state.docType === DocType.Unspecified;
  const disabled = invalidDocType || !state.markdown;

  return (
    <div>
      <Loader loaded={!state.loading} />
      <div className={css.title}>Add a README or LICENSE</div>
      <div className={css.body}>
        <form onSubmit={onSubmit}>
          <div className={css.selectContainer}>
            <div className={css.label}>Type</div>
            <FormSelect
              options={options}
              val={state.docType}
              onChangeValue={d => setState({ docType: d })}
            />
          </div>
          {!invalidDocType ? (
            <div className={css.markdownContainer}>
              <TextareaWithMarkdown
                label="Markdown"
                rows={12}
                value={state.markdown}
                onChange={m => setState({ markdown: m })}
                placeholder="Add markdown here"
              />
            </div>
          ) : (
            <p className={css.marTop}>
              Both README and LICENSE exist. Click on an individual document in
              the About section to edit.
            </p>
          )}
          <Button
            className={css.marTop}
            disabled={disabled}
            type="submit"
            data-cy="new-doc-create-button"
          >
            Create
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function NewDocForm(props: Props) {
  const res = useDocsRowsForDocPageQuery({ variables: props.params });
  if (res.loading) return <Loader loaded={false} />;
  return <Inner {...props} docRows={res.data?.docs.list} />;
}

function getOptions(docRows?: DocForDocPageFragment[]): Option[] {
  const options: Option[] = [
    { label: "README", value: DocType.Readme },
    { label: "LICENSE", value: DocType.License },
  ];
  return (
    options
      .map(o => disableExistingDocs(o, docRows))
      // Move disabled options to the end
      .sort(a => (a.isDisabled ? 1 : -1))
  );
}

function disableExistingDocs(
  o: Option,
  docRows?: DocForDocPageFragment[],
): Option {
  const alreadyExists = docRows?.some(
    r => r.docRow?.columnValues[0].displayValue === `${o.label}.md`,
  );
  if (alreadyExists) {
    return {
      label: `${o.label} already exists`,
      value: DocType.Unspecified,
      isDisabled: true,
    };
  }
  return o;
}
