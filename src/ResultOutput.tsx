import React, { useState } from "react";
import { useData } from "./context/data";
import type { PotType, PotId } from "./types";

type RepotResult = {
    repottingChains: Array<string>;
    potsToBuy: Map<number, number>;
    approximateSoilNeeded: number;
};

class Node<T> {
    data: T;
    next: Node<T> | null = null;

    constructor(data: T) {
        this.data = data;
    }
}

const calculateSoilNeededForPotSize = (diameter: number): number => {
    // We calculate volume for cylinder, but because the pots used are
    // bucket-shaped we deduct 35% of the final volume. The diameter is in
    // centimeters, so we need to divide by 10 to get decimeters (1 dm^3 = 1 l).
    return (
        Math.PI *
        (diameter / 2 / 10) ** 2 * // radius * radius
        ((diameter / 10) * 0.9) * // approximate height of the pot
        0.65 // approximate reduction of the cylinder to fit the bucket shape
    );
};

const ResultOutput: React.FC = () => {
    const { data } = useData();
    const [outputData, setOutputData] = useState<RepotResult>();

    const groupPotsBySize = (pots: PotType[]): Map<number, Array<PotType>> => {
        const potsPerSize: Map<number, Array<PotType>> = new Map();

        for (const pot of pots) {
            // we can skip the plants that don't need to be repotted
            if (pot.has_plant && (!pot.size_increase || pot.size_increase === 0)) continue;

            const potSize = pot.pot_size;
            if (potsPerSize.has(potSize)) {
                potsPerSize.get(potSize)?.push(pot);
            } else {
                potsPerSize.set(potSize, [pot]);
            }
        }
        return potsPerSize;
    };

    function build_final_result(chains: Array<Node<PotType>>) {
        const chainStrings: Array<string> = [];
        const potsToBuy: Map<number, number> = new Map();
        let soilNeeded = 0;
        for (const chain of chains) {
            let chainString = "";
            let chainHead: Node<PotType> | null = chain;
            while (chainHead) {
                const pot = chainHead.data;
                const newPotSize = pot.pot_size + (pot.size_increase ? pot.size_increase : 0);

                // build the chain string, so we can easily output the repotting sequence
                chainString = chainString.concat(`${pot.id}${chainHead.next ? " <-- " : ""}`);

                // calculate how much soil we need for the pot
                soilNeeded = soilNeeded + calculateSoilNeededForPotSize(newPotSize);

                // count new pots that need to be bought
                if (pot.id.includes("NEW")) {
                    potsToBuy.set(newPotSize, (potsToBuy.get(newPotSize) ?? 0) + 1);
                }

                chainHead = chainHead.next;
            }
            chainStrings.push(chainString);
        }
        return { chainStrings, potsToBuy, soilNeeded };
    }

    const buildRepottingChains = (potsPerSize: Map<number, Array<PotType>>) => {
        const processedPotIds: Array<PotId> = [];
        const potSizes: Array<number> = Array.from(potsPerSize.keys()).sort();
        const chains: Array<Node<PotType>> = [];

        for (const potSize of potSizes) {
            const pots = potsPerSize.get(potSize);
            if (!pots) {
                continue;
            }

            // iterate through all the pots of the size
            for (const pot of pots) {
                // if the pot doesn't have a plant, we can skip it here because it can't be repotted
                if (!pot.has_plant) continue;

                // if the pot was already processed, we can skip it
                if (processedPotIds.includes(pot.id)) continue;

                let chainHead: Node<PotType> | null = null;
                let chainTail: Node<PotType> | null = null;
                let nextInChain: PotType | undefined = pot;
                while (nextInChain) {
                    // put the current pot in the processed pots
                    processedPotIds.push(nextInChain.id);

                    const newSize: number = nextInChain.pot_size + nextInChain.size_increase;

                    const node = new Node(nextInChain);
                    if (chainHead === null) {
                        chainHead = node;
                        chainTail = node;
                    } else if (chainTail) {
                        chainTail.next = node;
                        chainTail = node;
                    }

                    // if the pot doesn't have a plant, we should stop the chain here
                    if (!nextInChain.has_plant) break;

                    // set nextInChain to a pot that matches "new size"
                    nextInChain = potsPerSize.get(newSize)?.find((x) => !processedPotIds.includes(x.id));

                    // If there is no next in the chain, it means we need to repot the plant in
                    // a new pot. We create a new pot with id=NEW_${newSize}.
                    if (nextInChain === undefined) {
                        const lastNode = new Node({ id: `NEW_${newSize}`, pot_size: newSize } as PotType);
                        lastNode.next = chainHead;
                        chainHead = lastNode;
                    }
                }

                if (chainHead) {
                    chains.push(chainHead);
                }
            }
        }
        return chains;
    };

    const findChains = (): void => {
        const nonRetiredPots = data.filter((pot) => pot.has_plant || !pot.retired);
        const potsPerSize = groupPotsBySize(nonRetiredPots);
        const chains = buildRepottingChains(potsPerSize);
        const { chainStrings, potsToBuy, soilNeeded } = build_final_result(chains);

        setOutputData({
            repottingChains: chainStrings,
            potsToBuy: potsToBuy,
            approximateSoilNeeded: soilNeeded,
        });
    };

    const parsePotsToBuyMap = (potsToBuy: Map<number, number>) => {
        const content = [<p>Pots needed:</p>];
        for (const [key, value] of potsToBuy) {
            content.push(
                <p key={`pot-${key}`}>
                    {key}: {value}
                </p>,
            );
        }
        return content;
    };

    return (
        <div className="flex flex-col me-4 py-4">
            <button type="button" className="FindChains" onClick={findChains}>
                Find chains
            </button>
            <div className="result">
                {outputData?.repottingChains.map((chainString, index) => {
                    return <p key={index}>{chainString}</p>;
                })}
                <br />
                {outputData?.potsToBuy ? parsePotsToBuyMap(outputData?.potsToBuy) : <p></p>}
                <br />
                <p>Approximate amount of soil needed: {outputData?.approximateSoilNeeded.toFixed(2)} l</p>
            </div>
        </div>
    );
};

export default ResultOutput;
