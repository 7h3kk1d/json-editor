module Main exposing (..)

import Browser
import Browser.Events exposing (onKeyDown)
import Css exposing (..)
import Css.Global
import Dict exposing (Dict)
import Html.Events exposing (onClick)
import Html.Styled exposing (..)
import Html.Styled.Events
import Html.Styled.Attributes exposing (css)
import Json.Decode



-- MAIN


main =
    Browser.document { init = init, update = update, view = view, subscriptions = subscriptions }



-- MODEL


type Json
    = JsonObject (List ( String, Json ))
    | JsonArray (List Json)
    | JsonNull
    | JsonInt Int
    | JsonFloat Float
    | JsonBoolean Bool
    | JsonString String


type alias Model =
    Json


init : () -> ( Model, Cmd Msg )
init _ =
    ( JsonArray
        [ JsonNull
        , JsonString "Hello"
        , JsonInt 7
        , JsonFloat 8.9
        , JsonBoolean True
        , JsonObject
            [ ( "Key", JsonString "Value" )
            , ( "Key", JsonString "Value" )
            , ( "Key", JsonString "Value" )
            ]
        ]
    , Cmd.none
    )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- UPDATE


type Msg
    = Keydown String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    ( model, Cmd.none )



-- VIEW


view : Model -> Browser.Document Msg
view model =
    { title = "Json Editor"
    , body =
        List.map toUnstyled (Css.Global.global [ Css.Global.body [ backgroundColor (hex "1c1818") ] ] :: main_dom model)
    }


keyDown : Attribute Msg
keyDown =
    Html.Styled.Events.on "click" (Json.Decode.map (\e -> Keydown (Debug.log "Seen" e))
     (Json.Decode.field "keyCode" Json.Decode.string))


main_dom : Model -> List (Html Msg)
main_dom model =
    [ div
        [ css [ displayFlex, justifyContent center, alignItems center, flexDirection column, height (vh 100) ]
        , keyDown
        ]
        [ render_json model ]
    ]


map_but_last : (a -> a) -> List a -> List a
map_but_last fn xs =
    List.map fn (List.take (List.length xs - 1) xs) ++ List.drop (List.length xs - 1) xs


render_json : Json -> Html Msg
render_json model =
    case model of
        JsonNull ->
            span [ css [ color (hex "d3d3d3") ] ] [ text "null" ]

        JsonString s ->
            span [ css [ color (hex "62a0ea") ] ] [ text ("\"" ++ s ++ "\"") ]

        JsonInt i ->
            span [ css [ color (hex "cc6060") ] ] [ text (String.fromInt i) ]

        JsonFloat f ->
            span [ css [ color (hex "cc6060") ] ] [ text (String.fromFloat f) ]

        JsonBoolean b ->
            span [ css [ color (hex "ffbe6f") ] ]
                [ text
                    (if b then
                        "True"

                     else
                        "False"
                    )
                ]

        JsonArray elems ->
            let
                array_entries =
                    List.map (\e -> [ render_json e ]) elems

                divs =
                    List.map (\e -> div [ css [ marginLeft (px 20) ] ] e)
                        (map_but_last (\e -> e ++ [ text "," ]) array_entries)
            in
            span [ css [ color (hex "a9a9a9") ] ]
                (span [] [ text "[" ]
                    :: divs
                    ++ [ span [] [ text "]" ] ]
                )

        JsonObject elems ->
            let
                entries =
                    List.map
                        (\entry ->
                            div
                                [ css
                                    [ color (hex "99c1f1")
                                    , marginLeft (px 20)
                                    ]
                                ]
                                entry
                        )
                        (map_but_last
                            (\e -> e ++ [ text "," ])
                            (List.map
                                (\( k, v ) ->
                                    [ text (String.join "" [ "\"", k, "\": " ])
                                    , render_json v
                                    ]
                                )
                                elems
                            )
                        )
            in
            span [ css [ color (hex "A9A9A9") ] ]
                [ span []
                    (List.concat
                        [ [ span [] [ text "{" ] ]
                        , entries
                        , [ span [] [ text "}" ] ]
                        ]
                    )
                ]
