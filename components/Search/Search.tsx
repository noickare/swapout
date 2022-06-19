// @ts-nocheck

import { createAutocomplete } from "@algolia/autocomplete-core";
import { getAlgoliaResults } from "@algolia/autocomplete-preset-algolia";
import algoliasearch from "algoliasearch/lite";
import { LoginOutlined, LogoutOutlined, SwapOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Space, Avatar, MenuProps, message, AutoComplete, Input } from 'antd';
import React from "react";
import Link from 'next/link';
import configs from "../../shared/configs";


const searchClient = algoliasearch(
    'R6W6RDTK71',
    '91b6188bb81ddbba505a70e08cd85a3b'
);

class AutocompleteClass extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            autocompleteState: {},
            query: '',
            options: [],
        };
        this.autocomplete = createAutocomplete({
            onStateChange: this.onChange,
            getSources() {
                return [
                    {
                        sourceId: "products",
                        getItems({ query }) {
                            return getAlgoliaResults({
                                searchClient,
                                queries: [
                                    {
                                        indexName: "items",
                                        query,
                                        params: {
                                            hitsPerPage: 5,
                                            highlightPreTag: "<mark>",
                                            highlightPostTag: "</mark>"
                                        },
                                    }
                                ],
                            });
                        },
                        getItemUrl({ item }) {
                            return item.url;
                        }
                    }
                ];
            }
        });
    }

    onChange = ({ state }) => {
        this.setState({ autocompleteState: state, query: state.query });
    }

    render() {
        const { autocompleteState } = this.state;
        return (
            <>
                <AutoComplete
                    dropdownClassName="certain-category-search-dropdown"
                    style={{ width: '50%' }}
                    options={this.state.options}
                    onSearch={(val) => {
                        const searchItems = autocompleteState.collections.map((collection, index) => {
                            const { source, items } = collection;
                            return items.map((item, index) => {
                                return {
                                    value: item.name,
                                    label: (
                                        <Link
                                            href={`/item/${item.uid}/details`}
                                        >
                                            <a>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        height: 40
                                                    }}
                                                >
                                                    <span>
                                                        {/* Found {} on{' '} */}
                                                        {item.name}
                                                    </span>
                                                    <span>
                                                        <img style={{ width: 40, height: '100%' }} src={item.images[0] || configs.noImage} alt="" />
                                                    </span>
                                                </div>
                                            </a>
                                        </Link>
                                    ),
                                }
                            })
                        })
                        this.setState({ options: searchItems[0] })
                    }}
                >
                    <Input.Search size="large" placeholder="Search"
                        value={this.state.query}
                        {...this.autocomplete?.getInputProps({})}
                    />

                </AutoComplete>
            </>
        );
    }
}

export default AutocompleteClass;