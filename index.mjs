import glob from 'glob';
import jsyaml from 'js-yaml';
import path from 'path';
import {readFile, writeFile} from 'fs/promises';
import {promisify} from 'util';

const outputDir = path.resolve('output');

function main() {
  return Promise.all([
    // authors
    promisify(glob)('authors/authors.yml')
      .then((files) => Promise.all(files.map((file) => readFile(file))))
      .then((buffers) =>
        Promise.all(buffers.map((buffer) => jsyaml.safeLoad(buffer))),
      )
      .then((array) => array.reduce((pre, cur) => [...pre, ...cur], []))
      .then((array) =>
        array.map(({id, ...rest}) => ({
          ...rest,
          ...(id && {_id: {$oid: id}}),
        })),
      )
      .then(JSON.stringify)
      .then((data) => writeFile(path.resolve(outputDir, 'authors.json'), data)),

    // series
    promisify(glob)('books/*/series.yml')
      .then((files) => Promise.all(files.map((file) => readFile(file))))
      .then((buffers) =>
        Promise.all(buffers.map((buffer) => jsyaml.safeLoad(buffer))),
      )
      .then((array) =>
        array.map(({id, books, relatedAuthors, relatedBooks, ...rest}) => ({
          ...rest,
          ...(id && {_id: {$oid: id}}),
          books:
            books?.map(({book, ...rest}) => ({book: {$oid: book}, ...rest})) ||
            [],
          relatedAuthors:
            relatedAuthors?.map((author) => ({$oid: author})) || [],
          relatedBooks: relatedBooks?.map((book) => ({$oid: book})) || [],
        })),
      )
      .then(JSON.stringify)
      .then((data) => writeFile(path.resolve(outputDir, 'series.json'), data)),

    // books
    promisify(glob)('books/*/books.yml')
      .then((files) => Promise.all(files.map((file) => readFile(file))))
      .then((buffers) =>
        Promise.all(buffers.map((buffer) => jsyaml.safeLoad(buffer))),
      )
      .then((array) => array.reduce((pre, cur) => [...pre, ...cur], []))
      .then((array) =>
        array.map(({id, authors, isbn, ...rest}) => ({
          ...rest,
          ...(id && {_id: {$oid: id}}),
          ...(isbn && {isbn: String(isbn)}),
          authors:
            authors?.map(({author, ...rest}) => ({
              author: {$oid: author},
              ...rest,
            })) || [],
        })),
      )
      .then(JSON.stringify)
      .then((data) => writeFile(path.resolve(outputDir, 'books.json'), data)),
  ]);
}

main();
