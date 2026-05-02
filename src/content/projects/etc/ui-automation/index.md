---
title: UI 자동화 (Unity)
category: etc
cover:
  style: cream
links:
  notion: https://www.notion.so/1d95b696de7b80128de9e539a1617131
description: Unity UI를 자동으로 바인딩하는 베이스 클래스를 만들어 본 기록.
---

Unity UI를 자동으로 바인딩하는 베이스 클래스를 만들어 본 기록.
`enum` 이름과 `GameObject` 자식 이름이 일치하도록 두면 `Bind<T>()` 한 줄로 한 번에 모두 매핑된다.

## `UI_Base`

```csharp
using System;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class UI_Base : MonoBehaviour
{
    Dictionary<Type, UnityEngine.Object[]> _objects = new Dictionary<Type, UnityEngine.Object[]>();

    protected void Bind<T>(Type type) where T : UnityEngine.Object
    {
        string[] names = Enum.GetNames(type);
        UnityEngine.Object[] objects = new UnityEngine.Object[names.Length];
        _objects.Add(typeof(T), objects);

        for (int i = 0; i < names.Length; i++)
        {
            if (typeof(T) == typeof(GameObject))
            {
                objects[i] = Utill.FindChild(gameObject, names[i], true);
            }
            else
            {
                objects[i] = Utill.FindChild<T>(gameObject, names[i], true);
            }
        }
    }

    protected T Get<T>(int index) where T : UnityEngine.Object
    {
        UnityEngine.Object[] objects = null;
        if (_objects.TryGetValue(typeof(T), out objects) == false)
            return null;

        return objects[index] as T;
    }

    protected TMP_Text GetText(int index) { return Get<TMP_Text>(index); }
    protected Button GetButton(int index) { return Get<Button>(index); }
    protected Image GetImage(int index) { return Get<Image>(index); }
}
```

## `UI_Button` — 사용 예

```csharp
using TMPro;
using UnityEngine;

public class UI_Button : UI_Base
{
    enum Texts { Text1, Text2 }
    enum Buttons { ButtonA, ButtonB }
    enum GameObjects { CubeA, CubeB }

    private void Start()
    {
        Bind<TMP_Text>(typeof(Texts));
        Get<TMP_Text>((int)Texts.Text1).text = "unity";

        Bind<GameObject>(typeof(GameObjects));
        Get<GameObject>((int)GameObjects.CubeB).transform.Translate(new Vector3(20, 20, 20));
    }
}
```

## `Utill`

```csharp
using UnityEngine;

public class Utill
{
    public static GameObject FindChild(GameObject go, string name = null, bool recursive = false)
    {
        Transform transform = FindChild<Transform>(go, name, recursive);
        if (transform == null) return null;
        return transform.gameObject;
    }

    public static T FindChild<T>(GameObject go, string name = null, bool recursive = false) where T : UnityEngine.Object
    {
        if (go == null) return null;

        if (recursive == false)
        {
            for (int i = 0; i < go.transform.childCount; i++)
            {
                Transform transform = go.transform.GetChild(i);
                if (string.IsNullOrEmpty(name) || transform.name == name)
                {
                    T component = transform.GetComponent<T>();
                    if (component != null) return component;
                }
            }
        }
        else
        {
            foreach (T component in go.transform.GetComponentsInChildren<T>())
            {
                if (string.IsNullOrEmpty(name) || component.name == name) return component;
            }
        }

        return null;
    }
}
```

