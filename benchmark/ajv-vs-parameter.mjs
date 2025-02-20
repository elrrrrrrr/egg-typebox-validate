import Benchmark from 'benchmark';
import addFormats from 'ajv-formats';
import { Type } from '@sinclair/typebox';
import Ajv from 'ajv';
import Parameter from 'parameter';

const getAjvInstance = () =>
  addFormats(new Ajv({}), [
    'date-time',
    'time',
    'date',
    'email',
    'hostname',
    'ipv4',
    'ipv6',
    'uri',
    'uri-reference',
    'uuid',
    'uri-template',
    'json-pointer',
    'relative-json-pointer',
    'regex',
  ])
    .addKeyword('kind')
    .addKeyword('modifier');

const suite = new Benchmark.Suite;

const DATA = {
  name: 'xiekw2010',
  description: 'desc',
  location: 'shanghai',
}

const ajv = getAjvInstance();
const p = new Parameter();

const typeboxRule = Type.Object({
  name: Type.String(),
  description: Type.Optional(Type.String()),
  location: Type.Enum({shanghai: 'shanghai', hangzhou: 'hangzhou'}),
})

const parameterRule = {
  name: 'string',
  description: {
    type: 'string',
    required: false,
  },
  location: ['shanghai', 'hangzhou'],
}

// add tests
suite
  .add('#ajv', function() {
    const rule = Type.Object({
      name: Type.String(),
      description: Type.Optional(Type.String()),
      location: Type.Enum({shanghai: 'shanghai', hangzhou: 'hangzhou'}),
    })
    ajv.validate(rule, DATA);
  })
  .add('#ajv define once', function() {
    ajv.validate(typeboxRule, DATA);
  })
  .add('#parameter', function() {
    const rule = {
      name: 'string',
      description: {
        type: 'string',
        required: false,
      },
      location: ['shanghai', 'hangzhou'],
    }
    p.validate(rule, DATA);
  })
  .add('#parameter define once', function() {
    p.validate(parameterRule, DATA);
  })
  // add listeners
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  // run async
  .run({ 'async': true });

/*
MacBook Pro(2.2 GHz 六核Intel Core i7)

#ajv x 941 ops/sec ±3.97% (73 runs sampled)
#ajv define once x 17,188,370 ops/sec ±11.53% (73 runs sampled)
#parameter x 2,544,118 ops/sec ±4.68% (79 runs sampled)
#parameter define once x 2,541,590 ops/sec ±5.34% (77 runs sampled)
Fastest is #ajv define once
*/
