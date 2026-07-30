<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%--
  Controller 請以 model.addAttribute("pageBlocksJson", JSON字串) 傳入區塊陣列。
  每筆資料至少包含 type、sortOrder；其餘內容請放在 content。
  例：{"type":"heading","sortOrder":1,"content":{"text":"主標題"}}
--%>
<%@ include file="index.html" %>
<script>
  window.loadPageBlocks(<c:out value="${pageBlocksJson}" escapeXml="false" default="[]" />);
</script>
