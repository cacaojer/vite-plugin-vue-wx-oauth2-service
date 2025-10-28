export default (val) => {
  const errArr = [];

  const { origin, pathname, search, hash } = new URL(val);
  const params = new URLSearchParams(search);
  const paramsNames = [
    // appid	必须	企业的CorpID
    "appid",

    // redirect_uri	必须	授权后重定向的回调链接地址，请使用urlencode对链接进行处理
    "redirect_uri",

    // response_type	必须	返回类型，此时固定为：code
    "response_type",

    // scope	必须	应用授权作用域。
    // snsapi_base：静默授权，可获取成员的基础信息（UserId）；
    // snsapi_privateinfo：手动授权，可获取成员的详细信息，包含头像、二维码等敏感信息（此时要求成员必须在应用可见范围内）。
    "scope",

    // agentid	必须	应用agentid，建议填上该参数（对于第三方应用和代开发自建应用，在填写该参数的情况下或者在工作台、聊天工具栏、应用会话内发起oauth2请求的场景中，会触发接口许可的自动激活）。snsapi_privateinfo时必填否则报错；
    "agentid",

    // state		重定向后会带上state参数，企业可以填写a-zA-Z0-9的参数值，长度不可超过128个字节
    // "state",
  ];

  for (const name of paramsNames) {
    const p = params.get(name);
    if (!p || p === "null" || p === "undefined") {
      errArr.push(`${name} is null`);
    }
  }

  // #wechat_redirect	必须	终端使用此参数判断是否需要带上身份信息
  if (!hash || hash !== "#wechat_redirect") {
    errArr.push(`hash: '${hash}' != '#wechat_redirect'`);
  }

  if (params.get("response_type") !== "code") {
    errArr.push(`response_type != 'code'`);
  }

  // snsapi_base：静默授权，可获取成员的基础信息（UserId）；
  // snsapi_privateinfo：手动授权，可获取成员的详细信息，包含头像、二维码等敏感信息（此时要求成员必须在应用可见范围内）。
  if (
    !Array.prototype.includes.call(
      ["snsapi_privateinfo", "snsapi_base"],
      params.get("scope"),
    )
  ) {
    errArr.push(`scope != 'snsapi_privateinfo || snsapi_base'`);
  }
  const redirect_uri = params.get("redirect_uri");
  errArr.push(`redirect_uri: ${redirect_uri}`);

  const res = {
    location: "",
    html: "",
  };
  if (errArr.length === 0) {
    try {
      const url = new URL(redirect_uri);
      const searchParams = url.searchParams;
      searchParams.set("code", "C-" + Date.now());
      if (params.get("state")) {
        searchParams.set("state", params.get("state"));
      }
      res.location = url.toString();
    } catch (e) {
      errArr.push(e.toString());
    }
  } else {
    res.html = new Blob(
      [
        `<!doctype html>
        <html>
          <head> <title>Wx Auth</title> </head>
          <body>
            <code style=" height: 62vh; width: 62vw; display: flex; justify-content: start;
                align-items: start; margin: auto; padding: 15px; border-radius: 10px;
                transform: translateY(19%); background: #000; color: white; font-weight: 500; ">
                ${[pathname, ...errArr].join("<br />")}
            </code>
          </body>
        </html>`,
      ],
      { type: "text/html" },
    );
  }
  return res;
};
