import { controller, httpGet, httpPost, httpPut, httpDelete, interfaces, requestParam, request, response } from 'inversify-express-utils';
import { getDocumentationData, Doc } from './inversify-express-docs';
import { injectable, inject } from 'inversify';
import { Response } from 'express';
import { Endpoint, Param, ControllerDefinition } from './interfaces';
import 'reflect-metadata';
import * as pug from 'pug';

@controller('/doc')
export default class DocController implements  interfaces.Controller {
  private basePath = 'node_modules/inversify-express-doc/dist/';
  private localPath = 'src/';
  private pugFile = 'header.pug';

  @Doc('This endpoint is used to show the API documentation')
  @httpGet('/')
  public getDocumentation(@request() request: { user: any}, @response() res: Response) {
    res.type('text/html');
    const compiledFunction = this.getCompileFunction(this.pugFile);
    res.send(compiledFunction({ controllers: getDocumentationData(), body: 'api'}));
  }

  @Doc('This endpoint is used to show endpoint documentation')
  @httpGet('/:controller/:endpoint')
  public getEndpointDocumentation(@requestParam('controller') controller: string, @requestParam('endpoint') endpoint: string, @response() res: Response) {
    res.type('text/html');
    const compiledFunction = this.getCompileFunction(this.pugFile);
    const controllerData: ControllerDefinition = getDocumentationData()[controller];
    const nocontrollerErr = this.testForExists(controllerData, res);
    if(nocontrollerErr){
      return nocontrollerErr;
    }
    const endpointData: Endpoint = controllerData.methods[endpoint];
    const noEndpointErr = this.testForExists(endpointData, res);
    if(noEndpointErr) {
      return noEndpointErr;
    }
    endpointData.basePath = controllerData.basePath;
    endpointData.body = 'endpoint';
    res.send(compiledFunction(endpointData));
  }

  private getCompileFunction(fileName: string) {
    let compiledFunction;
    try {
      compiledFunction = pug.compileFile(this.basePath + fileName);
    } catch(err) {      
      compiledFunction = pug.compileFile(this.localPath + fileName);
    }
    return compiledFunction;
  }

  private testForExists(data: any, res: any) {
    if (!data) {
      return res.status(404).send('Not Found');
    }
  }
}