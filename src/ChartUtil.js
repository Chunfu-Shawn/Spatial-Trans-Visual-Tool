import C2S from 'canvas2svg';
import {drawColorScheme} from './ColorSchemeLegend';
import {drawCategoricalLegend, getCategoricalLegendSize} from './LegendDrawer';
import {getDevicePixelRatio} from './util';

export const CANVAS_FONT = '12px Roboto Condensed,Helvetica,Arial,sans-serif';
export const SVG_FONT = '12px Helvetica,Arial,sans-serif';

export function saveImage(trace, chartSize, draw, format) {
  let context;
  let canvas = null;
  const totalSize = {width: chartSize.width, height: chartSize.height};
  let name = trace.name;
  if (name === '__count') {
    name = 'count';
  }
  if (format !== 'svg') {
    canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    context = canvas.getContext('2d');
  } else {
    context = new C2S(100, 100);
  }
  if (!trace.continuous) {
    const legendSize = getCategoricalLegendSize(
      context,
      name,
      trace.colorScale.domain()
    );
    totalSize.width += legendSize.width;
    totalSize.height = Math.max(legendSize.height, chartSize.height);
  } else {
    totalSize.height += 150;
  }
  if (format === 'svg') {
    context = new window.C2S(totalSize.width, totalSize.height);
  } else {
    const devicePixelRatio = getDevicePixelRatio();
    canvas.width = totalSize.width * devicePixelRatio;
    canvas.height = totalSize.height * devicePixelRatio;
    context = canvas.getContext('2d');
    context.scale(devicePixelRatio, devicePixelRatio);
    context.fillStyle = 'white';
    context.fillRect(0, 0, totalSize.width, totalSize.height);
  }

  draw(context, chartSize, format);

  if (!trace.continuous) {
    context.translate(chartSize.width, 2);
    drawCategoricalLegend(
      context,
      trace.colorScale,
      name,
      trace.colorScale.domain()
    );
  } else {
    context.translate(chartSize.width / 2 - 75, chartSize.height + 2);
    drawColorScheme(context, trace.colorScale);
  }

  if (format === 'svg') {
    let svg = context.getSerializedSvg();
    // let prefix = [];
    // prefix.push('<?xml version="1.0" encoding="utf-8"?>\n');
    // prefix.push('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"' +
    //     ' "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n');
    // svg = prefix.join('') + svg;
    let blob = new Blob([svg], {
      type: 'text/plain;charset=utf-8',
    });
    window.saveAs(blob, name + '.svg');
  } else {
    canvas.toBlob((blob) => {
      window.saveAs(blob, name + '.png', true);
    });
  }
}
