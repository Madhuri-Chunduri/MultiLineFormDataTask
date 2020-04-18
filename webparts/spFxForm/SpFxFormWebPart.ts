import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart, WebPartContext } from '@microsoft/sp-webpart-base';
import FormComponent from "./components/FormComponent";
import * as strings from 'SpFxFormWebPartStrings';
import SpFxForm from './components/SpFxForm';
import { ISpFxFormProps } from './components/ISpFxFormProps';

export interface ISpFxFormWebPartProps {
  description: string,
  context: WebPartContext
}

export default class SpFxFormWebPart extends BaseClientSideWebPart<ISpFxFormWebPartProps> {

  public render(): void {
    const element: React.ReactElement<ISpFxFormProps> = React.createElement(
      FormComponent, {
      context: this.context
    }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
