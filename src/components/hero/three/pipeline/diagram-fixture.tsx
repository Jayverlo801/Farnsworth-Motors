import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync,writeFileSync} from 'node:fs';
import {RecordDiagram} from '../../../ui/RecordDiagram';
import type {Vehicle} from '../../../../lib/vehicles/types';

const vehicle = {slug:'illustrative-diagram-test',record:{structuralAffected:true,
  partsReplaced:[{name:'Quarter RR',partId:'quarter_RR',oem:false},{name:'Rear bumper',partId:'rear_bumper',oem:false}]}} as Vehicle;
for(const view of ['top','side']){
  const svg=readFileSync(`public/3d/diagram/coupe-${view}.svg`,'utf8');
  const html=renderToStaticMarkup(<RecordDiagram vehicle={vehicle} diagram={svg}/>);
  writeFileSync(`src/components/hero/three/pipeline/verification/diagram-${view}.html`,html);
}
