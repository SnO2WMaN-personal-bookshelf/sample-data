---
to: series/<%= title %>.yml
---

title: "<%= title %>"
concluded: <%= concluded %>

books:
  <% for(let i = 1; i <= volumes ; i++) { %>
    - title: "<%= title %>(<%= i %>)"
      serial: <%= i %>
  <% } %>

authors:
  <% authors.forEach(function (author) { %>
    - name: "<%= author %>"
  <% }); %>
