# Licence keys

120 icons are free. The rest need a licence key.

## For buyers

```
npx magic-glyphs login XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX   # the key on your Gumroad receipt, once per computer
npx magic-glyphs licence                   # shows who the key belongs to
npx magic-glyphs list --free               # the free set
npx magic-glyphs logout                    # also frees this computer's device slot
```

`login` swaps the Gumroad key for a signed Magic Glyphs key (it starts with `MG1.`) and downloads the full set. `npx magic-glyphs update` fetches icons added since.

## Devices

A licence works on a set number of devices at once. A device is one computer using the command line tool or MCP server, or one browser on this website.

| Plan | People | Devices |
|---|---|---|
| Personal | 1 | 3 |
| Team | up to 10 | 20 |
| Business | up to 50 | 100 |

A device that has not been used for 30 days is freed automatically. To free one straight away, run `npx magic-glyphs logout` on it, or choose "Remove key from this browser" on the website. If you reach the limit, the error says so and tells you how to free a device.

There is also a daily download limit, set well above what normal use needs.

## Build servers and CI

Build servers would otherwise use up devices, so they get their own key:

```
npx magic-glyphs build-key        # run once on your own computer after logging in
```

Store the key it prints as a secret named `MAGIC_GLYPHS_KEY` in your CI, then run `npx magic-glyphs sync` in the build. A build key does not use a device, shares the daily download limit, and stops working if the licence is revoked.

## Your downloads carry your licence

Each download of the full set records which licence it was made for. Keep your key private: it is tied to your purchase.

With a key, `add`, `static`, `registry` and the MCP server's `get_icon` return every icon. Without one they return the free set and explain what is missing.

The full terms are in LICENSE.md at the top of this package.
