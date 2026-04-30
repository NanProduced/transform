import React from "react";
import { Formik, FormikProps } from "formik";
import Dialog from "@components/ui/Dialog";

export enum InputType {
  SWITCH = 1,
  TEXT_INPUT,
  SELECT
}

interface FormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => void;
  title: string;
  formsFields: {
    key: string;
    type: InputType;
    label: string;
    isDisabled?: (values: T) => boolean;
    props?: any;
    options?: { label: string; value: string | number }[];
  }[];
  open: boolean;
  toggle: () => void;
}

const Form = <T extends object>({
  initialValues,
  onSubmit,
  title,
  formsFields,
  open,
  toggle
}: FormProps<T> & { children?: React.ReactNode }) => {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={values => {
        onSubmit(values);
      }}
    >
      {(props: FormikProps<T>) => {
        const handleConfirm = () => {
          props.submitForm();
          toggle();
        };

        const handleCancel = () => {
          props.resetForm();
          toggle();
        };

        return (
          <Dialog
            isOpen={open}
            onClose={toggle}
            title={title}
            footer={
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  Confirm
                </button>
              </>
            }
          >
            <div className="space-y-4">
              {formsFields.map(
                (
                  { type, key, label, isDisabled, props: _props, options },
                  i
                ) => {
                  const _isDisabled = isDisabled
                    ? isDisabled(props.values)
                    : undefined;

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2"
                    >
                      <span
                        className={`text-sm font-medium ${
                          _isDisabled ? "opacity-40" : ""
                        } text-foreground`}
                        style={{ textTransform: "capitalize" }}
                      >
                        {label}
                      </span>

                      {type === InputType.SWITCH && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!_isDisabled) {
                              props.setFieldValue(
                                key,
                                !(props.values as any)[key]
                              );
                            }
                          }}
                          disabled={_isDisabled}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            (props.values as any)[key]
                              ? "bg-accent"
                              : "bg-muted"
                          } ${
                            _isDisabled
                              ? "opacity-40 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              (props.values as any)[key]
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      )}

                      {type === InputType.TEXT_INPUT && (
                        <input
                          type="text"
                          value={(props.values as any)[key] || ""}
                          onChange={props.handleChange}
                          name={key}
                          disabled={_isDisabled}
                          className="w-48 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      )}

                      {type === InputType.SELECT && options && (
                        <select
                          value={(props.values as any)[key]}
                          onChange={props.handleChange}
                          name={key}
                          disabled={_isDisabled}
                          className="w-48 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {options.map(({ label, value }) => (
                            <option key={String(value)} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </Dialog>
        );
      }}
    </Formik>
  );
};

export default Form;
