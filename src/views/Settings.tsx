/**
 * Copyright 2023 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
import { Box, Combobox, ComboboxInput, ComboboxList, ComboboxOption, ComponentsProvider, FieldCheckbox, FieldTextArea, Heading, Label, MaybeComboboxOptionObject, MixedBoolean, Space, SpaceVertical, Span } from '@looker/components'
import React, { FormEvent, useContext, useEffect, useState } from 'react'
import { PromptTemplateService, PromptTemplateTypeEnum } from '../services/PromptTemplateService'
import { Logger } from '../utils/Logger'
import { PromptService } from '../services/PromptService'
import { ExtensionContext } from '@looker/extension-sdk-react'


/**
 * Settings
 */
export const Settings: React.FC = () => {  
  const [message] = useState('')
  const [logLevel, setLogLevel] = useState<string>("info");
  const [usingNativeBQML, setUsingNativeBQML] = useState(true as MixedBoolean)
  const [customPrompt, setCustomPrompt] = useState<string>();  

  const storageShowInstructions = "showInstructions";
  const storageNativeBQML = "usingNativeBQML";
  const storageLogLevel = "logLevel";
  const storageCustomPrompt = "customPrompt";

  const { core40SDK } =  useContext(ExtensionContext)
  const promptService: PromptService = new PromptService(core40SDK);
  

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Every time it reloads
    const customPrompt = JSON.parse(window.sessionStorage.getItem(storageCustomPrompt)!)
    const promptService = new PromptTemplateService(customPrompt);
    setCustomPrompt(promptService.getByType(PromptTemplateTypeEnum.FIELDS_FILTERS_PIVOTS_SORTS));
    const cStorageNativeBQML = window.sessionStorage.getItem(storageNativeBQML) === "true" || window.sessionStorage.getItem(storageNativeBQML) === null;
    const cStorageShowInstructions = window.sessionStorage.getItem(storageShowInstructions) === "true" || window.sessionStorage.getItem(storageShowInstructions) === null;
    const cStorageLogLevel = window.sessionStorage.getItem(storageLogLevel);
    if(cStorageNativeBQML!= null)
    {
      setUsingNativeBQML(cStorageNativeBQML);
    }
    if(cStorageLogLevel!=null)
    {
      setLogLevel(cStorageLogLevel);
      Logger.setLoggerLevelByName(cStorageLogLevel);
    } 

  }, [])

  const handleChangePrompt = (e: FormEvent<HTMLTextAreaElement>) => {
    setCustomPrompt(e.currentTarget.value);
    const tempCustomPrompt: { [key in PromptTemplateTypeEnum]?: string } = {
      [PromptTemplateTypeEnum.FIELDS_FILTERS_PIVOTS_SORTS]: e.currentTarget.value
    }
    window.sessionStorage.setItem(storageCustomPrompt, JSON.stringify(tempCustomPrompt));
  }

  const handleChangeCombo= (comboboxComponent: MaybeComboboxOptionObject) => {
    if (!comboboxComponent) {
      throw new Error('missing combobox componenet');
    }
    Logger.setLoggerLevelByName(comboboxComponent.value);
    window.sessionStorage.setItem(storageLogLevel, comboboxComponent.value);
    setLogLevel(comboboxComponent.value);
    Logger.debug(comboboxComponent.value);
  }

  return (
    <ComponentsProvider>          
      <Box display="flex" m="large">
          <SpaceVertical>          
          <Label>Console Log Level</Label>
          <Combobox  width={"300px"} value={logLevel} onChange={handleChangeCombo}>
            <ComboboxInput />
            <ComboboxList>
              <ComboboxOption value="trace"/>
              <ComboboxOption value="debug" />
              <ComboboxOption value="info" />
              <ComboboxOption value="warn" />
              <ComboboxOption value="error" />
            </ComboboxList>
          </Combobox>

          {/* TODO: implement fine tuned model and option to change  */}
          {/* <FieldCheckbox
            label="Yes - Use Native BQML Method - Fine Tuned not implemented"
            checked={usingNativeBQML}
            onChange={() => {
              window.sessionStorage.setItem(storageNativeBQML, usingNativeBQML?"false": "true");
              setUsingNativeBQML(!usingNativeBQML);
            }}
          /> */}

          <FieldTextArea
            width="100%"
            height="500px"
            label="Prompt Field, Filters, Sorts - Template for BQML.GENERATE_TEXT"
            value={customPrompt}
            onChange={handleChangePrompt}
          />
        </SpaceVertical>
      </Box>

    </ComponentsProvider>
  )
}
